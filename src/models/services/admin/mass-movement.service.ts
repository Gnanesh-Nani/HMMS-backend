import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { CreateMassMovementDto } from "src/models/dtos/create-mass-movement.dto";
import { Block, BlockDocument } from "src/models/schemas/block.schema";
import { Hostel, HostelDocument } from "src/models/schemas/hostel.schema";
import { MassMovement, MassMovementDocument } from "src/models/schemas/mass-movement.schema";
import { Room, RoomDocument } from "src/models/schemas/room.schema";
import { handleError } from "src/utils/handle-error";
import { handleResponse } from "src/utils/response.utils";
import { PaymentService } from "../payment.service";
import { CreatePaymentDto } from "src/models/dtos/create-payment.dto";
import { FeeTypes } from "src/common/enums/fee-types.enums";
import { StudentProfile, StudentProfileDocument } from "src/models/schemas/student-profile.schema";
import { RoomService } from "./room.service";
import { Payment, PaymentDocument } from "src/models/schemas/payment.schema";
import { PaymentStatus } from "src/common/enums/payment-status.enum";
import { StudentPreference, StudentPreferenceDocument } from "src/models/schemas/student-preference.schema";
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { error } from "console";

const execAsync = promisify(exec);

export interface HostelPaymentPercentage {
    hostelId: string;
    totalNoOfPayments: number;
    completedNoOfPayments: number;
}

export interface PreferenceEntry {
    id: string;
    name: string;
    registerNumber: string;
    gender: string;
    year: number;
    department: string;
    physicallyChallenged: Boolean;
    preferedRoomMates: string[];
    wakeupTime: string;
    sleepTime: string;
    studyHabit: string;
    healthCondition: string;
}

@Injectable()
export class MassMovementService {
    constructor(
        @InjectConnection() private readonly connection: mongoose.Connection,
        @InjectModel(MassMovement.name) private massMovementModel: Model<MassMovementDocument>,
        @InjectModel(Hostel.name) private hostelModel: Model<HostelDocument>,
        @InjectModel(Block.name) private blockModel: Model<BlockDocument>,
        @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
        @InjectModel(StudentPreference.name) private readonly studentPreferenceModel: Model<StudentPreferenceDocument>,
        @InjectModel(StudentProfile.name) private readonly studentProfileModel: Model<StudentProfileDocument>,
        @Inject(PaymentService) private readonly paymentService: PaymentService,
        @Inject(RoomService) private readonly roomService: RoomService,
    ) { }

    async getAllMassMovement() {
        const massMovements = await this.massMovementModel.find();
        if (massMovements.length == 0)
            return handleError("No Mass Movement Found");
        return handleResponse(massMovements, "sucessfully retrived Mass-Movements");
    }

    async getPaymentStatusOfMassMovement(massMovementId: string) {
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            // Fetch mass movement with session
            const massMovement = await this.massMovementModel.findById(massMovementId);
            if (!massMovement) {
                return handleError("Invalid Mass Movement ID");
            }

            const hostels = massMovement.hostels;
            let totalNoOfPayments = 0;
            let completedNoOfPayments = 0;
            const hostelsPaymentPercentage: HostelPaymentPercentage[] = [];

            // Iterate through each hostel
            for (let i = 1; i < hostels.length; i++) {
                const currentHostelId = hostels[i];

                const payments = await this.paymentModel
                    .find({ massMovement: massMovementId, hostel: currentHostelId.toString() });

                const totalNoOfPaymentsHostel = payments.length;
                const completedNoOfPaymentsHostel = payments.filter(
                    (payment) => payment.status === PaymentStatus.SUCCESS
                ).length;

                // Push individual hostel data
                hostelsPaymentPercentage.push({
                    hostelId: currentHostelId.toString(),
                    totalNoOfPayments: totalNoOfPaymentsHostel,
                    completedNoOfPayments: completedNoOfPaymentsHostel,
                });

                // Update global totals
                totalNoOfPayments += totalNoOfPaymentsHostel;
                completedNoOfPayments += completedNoOfPaymentsHostel;
            }

            // Commit the transaction
            await session.commitTransaction();

            // Calculate overall percentage
            const overallCompletionPercentage =
                totalNoOfPayments === 0
                    ? 0
                    : Math.round((completedNoOfPayments / totalNoOfPayments) * 100);

            return handleResponse(
                {
                    massMovementId,
                    totalNoOfPayments,
                    completedNoOfPayments,
                    overallCompletionPercentage,
                    hostelsPaymentPercentage,
                },
                "Payment status retrieved successfully"
            );
        } catch (error) {
            await session.abortTransaction();
            return handleError(error.message);
        } finally {
            session.endSession();
        }
    }

    async createMassMovement(body: CreateMassMovementDto) {
        // if(true)
        //     return body;
        const currentDate = new Date();
        const dueDate = new Date(currentDate);
        dueDate.setDate(currentDate.getDate() + 15);

        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const { hostels: hostelsId } = body;
            if (hostelsId.length < 2) throw new Error("At least two hostels are required.");

            const massMovement = await new this.massMovementModel({hostels:hostelsId}).save({ session });

            for (let i = 0; i < hostelsId.length - 1; i++) {
                const currentHostelId = hostelsId[i];
                const nextHostelId = hostelsId[i + 1];

                const [currentHostel, nextHostel] = await Promise.all([
                    this.hostelModel.findById(currentHostelId, null, { session }),
                    this.hostelModel.findById(nextHostelId, null, { session }),
                ]);

                if (!currentHostel || !nextHostel)
                    throw new Error("Invalid hostel ID found during migration.");

                const blocks = await this.blockModel.find({ hostelId: currentHostelId }).session(session);
                for (const block of blocks) {
                    const rooms = await this.roomModel.find({ blockId: block.id }).session(session);

                    for (const room of rooms) {
                        for (const studentIdObj of room.currentStudents) {
                            const studentId = studentIdObj.toString();

                            await this.roomService.removeStudent(room.id, studentId, session);

                            const paymentDto: CreatePaymentDto = {
                                studentProfileId: studentId,
                                type: FeeTypes.HOSTEL_FEE,
                                amount: nextHostel.hostelFee,
                                description: "Hostel Migration Fee",
                                dueDate: dueDate.toISOString(),
                                massMovement: massMovement.id,
                                hostel: nextHostelId
                            };

                            await Promise.all([
                                this.studentProfileModel.findByIdAndUpdate(
                                    studentId,
                                    { $set: { hostel: null }, $inc: { year: 1 } },
                                    { session },
                                ),
                                this.paymentService.allocatePayment(paymentDto, session),
                            ]);
                        }
                    }
                }
            }

            // Handle final year
            const finalYearHostel = await this.hostelModel.findById(hostelsId.at(-1), null, { session });
            if (!finalYearHostel) throw new Error("Invalid final year hostel ID");

            const finalBlocks = await this.blockModel.find({ hostelId: finalYearHostel.id }).session(session);
            for (const block of finalBlocks) {
                const rooms = await this.roomModel.find({ blockId: block.id }).session(session);
                for (const room of rooms) {
                    for (const studentIdObj of room.currentStudents) {
                        const studentId = studentIdObj.toString();
                        await this.roomService.removeStudent(room.id, studentId, session);
                        await this.studentProfileModel.findByIdAndUpdate(
                            studentId,
                            { $set: { hostel: null,year: 0,passOut: true } },
                            { session },
                        );
                    }
                }
            }

            await session.commitTransaction();
            return handleResponse("Mass Movement Done successfully");
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        } 
    }

    async createPreferenceDataSet(massMovementId: string,year:number,session?: mongoose.ClientSession) {
        const studentProfiles = await this.studentProfileModel.find({year,hostel:null});
        const dataSet:PreferenceEntry[] = [];
        for(const studentProfile of studentProfiles){
            const isPaymentDone = await this.paymentModel.findOne({massMovement:massMovementId,studentProfileId:studentProfile.id,status:PaymentStatus.SUCCESS});
            if(!isPaymentDone)
                continue;
            const studentPreference = await this.studentPreferenceModel.findOne({studentProfileId: studentProfile.id});
            
            let dataItem : PreferenceEntry;

            if(!studentPreference){
                dataItem = {
                    id: studentProfile.id,
                    name: studentProfile.name,
                    registerNumber: studentProfile.registerNo,
                    gender: studentProfile.gender,
                    year: studentProfile.year,
                    department: studentProfile.department,
                    physicallyChallenged: studentProfile.physicallyChallenged,
                    preferedRoomMates: [],
                    wakeupTime: "08:00:00",
                    sleepTime: "08:00:00",
                    studyHabit: "flexible",
                    healthCondition: "none"
                }
            }
            else {
                dataItem = {
                    id: studentProfile.id,
                    name: studentProfile.name,
                    registerNumber: studentProfile.registerNo,
                    gender: studentProfile.gender,
                    year: studentProfile.year,
                    department: studentProfile.department,
                    physicallyChallenged: studentProfile.physicallyChallenged,
                    preferedRoomMates: studentPreference.preferredRoommates,
                    wakeupTime: studentPreference.wakeupTime,
                    sleepTime: studentPreference.sleepTime,
                    studyHabit: studentPreference.studyHabit,
                    healthCondition: studentPreference.healthCondition
                }
            }
            dataSet.push(dataItem);
        }
        Logger.debug(dataSet);
        return handleResponse(dataSet,"sucessfully created dataset");
    }

    async triggerAllocation(massMovementId: string, hostelId: string, year: number): Promise<any> {
    Logger.log(`Triggering allocation for MassMovement: ${massMovementId}, Hostel: ${hostelId}, Year: ${year}`);

    try {
      // Get the path to your Python script
      const pythonScriptPath = join(process.cwd(), 'src', 'scripts', 'hostel_allocation.py');
      const venvPythonPath = join(process.cwd(), 'venv', 'bin', 'python3');
      
      Logger.log(`Executing Python script: ${pythonScriptPath}`);

      // Use the virtual environment Python
      const command = `"${venvPythonPath}" "${pythonScriptPath}" "${massMovementId}" "${hostelId}" "${year}"`;
      Logger.log(`Command: ${command}`);

      const { stdout, stderr } = await execAsync(command, {
        timeout: 300000, // 5 minutes timeout
        cwd: process.cwd(), // Run from project root
      });

      if (stderr) {
        Logger.warn(`Python script stderr: ${stderr}`);
      }

      Logger.log('Python script executed successfully');
      Logger.log(`Python script output: ${stdout}`);

      // Try to parse JSON output from Python script
      try {
        const result = JSON.parse(stdout);
        return {
          success: true,
          message: 'Allocation completed successfully',
          data: result
        };
      } catch (parseError) {
        // If output is not JSON, return as string
        return {
          success: true,
          message: 'Allocation completed',
          data: { output: stdout }
        };
      }

    } catch (error) {
      Logger.error(`Error executing allocation script: ${error.message}`);
      return {
        success: false,
        message: `Allocation failed: ${error.message}`,
        data: null
      };
    }
  }
}