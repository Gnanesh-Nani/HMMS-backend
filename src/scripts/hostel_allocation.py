import requests
import sys
import json
from datetime import datetime

# ---------------------- CONFIG -----------------------
BASE_URL = "http://localhost:3001"
JWT_COOKIE = "by_pass"
# ----------------------------------------------------

session = requests.Session()
session.cookies.set("jwt", JWT_COOKIE)

class HostelAllocationSystem:
    def __init__(self, base_url, jwt_cookie):
        self.base_url = base_url
        session.cookies.set("jwt", jwt_cookie)
        self.session = session

    def get_mass_movement_dataset(self, mass_movement_id, year):
        """Get dataset from API instead of CSV"""
        try:
            response = self.session.get(
                f"{self.base_url}/mass-movement/get-dataset/{mass_movement_id}/{year}"
            )
            print(f"📡 Dataset API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"📡 Dataset API Response: {json.dumps(data, indent=2)}")
                
                if data.get("error", True):  # Default to True if key doesn't exist
                    raise Exception(f"API Error: {data.get('message', 'Unknown error')}")
                return data.get("data", [])
            else:
                raise Exception(f"HTTP Error: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Error fetching dataset: {str(e)}")
            raise

    def get_hostel_structure(self, hostel_id):
        """Get hostel structure with current occupancy"""
        try:
            print(f"📡 Fetching hostel structure for: {hostel_id}")
            hostel_response = self.session.get(f"{self.base_url}/hostel/{hostel_id}")
            print(f"📡 Hostel API Response Status: {hostel_response.status_code}")
            
            if hostel_response.status_code != 200:
                raise Exception(f"Failed to fetch hostel: {hostel_response.text}")
                
            hostel = hostel_response.json().get("data", {})
            print(f"🏢 Hostel: {hostel.get('name', 'Unknown')}")

            blocks_response = self.session.get(f"{self.base_url}/hostel/{hostel_id}/block")
            print(f"📡 Blocks API Response Status: {blocks_response.status_code}")
            
            if blocks_response.status_code != 200:
                raise Exception(f"Failed to fetch blocks: {blocks_response.text}")
                
            blocks = blocks_response.json().get("data", [])
            print(f"🏢 Found {len(blocks)} blocks")

            all_rooms = []
            for block in blocks:
                print(f"📡 Fetching rooms for block: {block.get('id')}")
                rooms_response = self.session.get(f"{self.base_url}/blocks/{block['id']}/rooms")
                print(f"📡 Rooms API Response Status: {rooms_response.status_code}")
                
                if rooms_response.status_code == 200:
                    rooms_data = rooms_response.json().get("data", [])
                    
                    # For each room, get detailed info including currentStudents
                    for r in rooms_data:
                        r["blockName"] = block.get("name", "Unknown")
                        # Get full room details to get currentStudents
                        room_details = self.get_room_details(r["id"])
                        if room_details:
                            r["currentStudents"] = room_details.get("currentStudents", [])
                        else:
                            r["currentStudents"] = []
                            
                    all_rooms.extend(rooms_data)
                    print(f"🏢 Found {len(rooms_data)} rooms in block {block.get('name')}")
                else:
                    print(f"⚠️ Failed to fetch rooms for block {block['id']}: {rooms_response.text}")

            print(f"🏢 Total rooms: {len(all_rooms)}")
            return hostel, blocks, all_rooms

        except Exception as e:
            print(f"❌ Error fetching hostel structure: {str(e)}")
            raise

    def get_room_details(self, room_id):
        """Get detailed room information including currentStudents"""
        try:
            response = self.session.get(f"{self.base_url}/room/{room_id}")
            if response.status_code == 200:
                data = response.json()
                if data.get("error", False):
                    print(f"⚠️ API error fetching room {room_id}: {data.get('message')}")
                    return None
                return data.get("data", {})
            else:
                print(f"⚠️ HTTP error fetching room {room_id}: {response.status_code}")
                return None
        except Exception as e:
            print(f"⚠️ Exception fetching room {room_id}: {e}")
            return None

    def get_available_capacity(self, room):
        """Calculate available capacity in room"""
        try:
            current_students_count = len(room.get("currentStudents", []))
            max_capacity = room.get("maxCapacity", 1)
            available = max(0, max_capacity - current_students_count)
            print(f"🏠 Room {room.get('roomNo')} - Capacity: {max_capacity}, Current: {current_students_count}, Available: {available}")
            return available
        except Exception as e:
            print(f"⚠️ Error calculating capacity for room: {e}")
            return 0

    def allocate_student_to_room(self, room_id, student_id, hostel_id):
        """Allocate student to room using the PATCH API"""
        try:
            payload = {
                "hostelId": hostel_id
            }
            print(f"📡 Allocating student {student_id} to room {room_id}")
            response = self.session.patch(
                f"{self.base_url}/room/{room_id}/allocate/{student_id}",
                json=payload
            )
            
            print(f"📡 Allocation API Response Status: {response.status_code}")
            print(f"📡 Allocation API Response: {response.text}")
            
            if response.status_code == 200:
                result = response.json()
                # Check if there's an error field in the response
                if result.get("error", False):
                    print(f"❌ Allocation failed for {student_id}: {result.get('message', 'Unknown error')}")
                    return False
                else:
                    print(f"✅ Allocated student {student_id} to room {room_id}")
                    return True
            else:
                print(f"❌ HTTP Error allocating {student_id}: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Exception during allocation: {e}")
            return False

    def time_to_minutes(self, t):
        """Convert time string to minutes"""
        try:
            if isinstance(t, str):
                # Handle different time formats
                time_formats = ["%H:%M:%S", "%H:%M"]
                for fmt in time_formats:
                    try:
                        d = datetime.strptime(t.strip(), fmt)
                        return d.hour * 60 + d.minute
                    except ValueError:
                        continue
                print(f"⚠️ Could not parse time: {t}")
            return 0
        except Exception as e:
            print(f"⚠️ Error parsing time {t}: {e}")
            return 0

    def allocate_rooms(self, students, rooms, hostel_id):
        """Enhanced allocation algorithm"""
        print(f"🎯 Starting allocation for {len(students)} students across {len(rooms)} rooms")
        
        # Pre-process student data
        for s in students:
            s["wakeup"] = self.time_to_minutes(s.get("wakeupTime", "00:00:00"))
            s["sleep"] = self.time_to_minutes(s.get("sleepTime", "00:00:00"))
            s["physicallyChallenged"] = s.get("physicallyChallenged", False)
            s["preferedRoomMates"] = s.get("preferedRoomMates", [])
            s["registerNumber"] = str(s.get("registerNumber", ""))
            print(f"👤 Student: {s.get('name')} - Challenged: {s['physicallyChallenged']}")

        allocation_results = []
        unallocated = []
        
        # Separate physically challenged students for ground floor preference
        physically_challenged = [s for s in students if s["physicallyChallenged"]]
        normal_students = [s for s in students if not s["physicallyChallenged"]]
        
        print(f"👥 Students: {len(physically_challenged)} physically challenged, {len(normal_students)} normal")

        # Separate ground floor and other rooms
        ground_rooms = [r for r in rooms if r.get("floorNo", 1) == 0]
        other_rooms = [r for r in rooms if r.get("floorNo", 1) != 0]
        
        print(f"🏢 Rooms: {len(ground_rooms)} ground floor, {len(other_rooms)} other floors")

        # Allocate physically challenged students to ground floor first
        for student in physically_challenged:
            allocated = False
            for room in ground_rooms:
                if self.get_available_capacity(room) > 0:
                    success = self.allocate_student_to_room(room["id"], student["id"], hostel_id)
                    if success:
                        allocation_results.append({
                            "student": student["name"],
                            "studentId": student["id"],
                            "registerNumber": student["registerNumber"],
                            "roomNo": room["roomNo"],
                            "block": room["blockName"],
                            "floor": room["floorNo"]
                        })
                        # Update room occupancy
                        room["currentStudents"] = room.get("currentStudents", []) + [student["id"]]
                        allocated = True
                        print(f"🏛️  Allocated physically challenged student {student['name']} to ground floor room {room['roomNo']}")
                        break
            
            if not allocated:
                # Try other rooms if no ground floor available
                for room in other_rooms:
                    if self.get_available_capacity(room) > 0:
                        success = self.allocate_student_to_room(room["id"], student["id"], hostel_id)
                        if success:
                            allocation_results.append({
                                "student": student["name"],
                                "studentId": student["id"],
                                "registerNumber": student["registerNumber"],
                                "roomNo": room["roomNo"],
                                "block": room["blockName"],
                                "floor": room["floorNo"]
                            })
                            room["currentStudents"] = room.get("currentStudents", []) + [student["id"]]
                            allocated = True
                            print(f"🏛️  Allocated physically challenged student {student['name']} to room {room['roomNo']}")
                            break
            
            if not allocated:
                unallocated.append(student["name"])
                print(f"❌ Could not allocate physically challenged student: {student['name']}")

        # Build friend groups for normal students
        student_id_map = {s["id"]: s for s in normal_students}
        allocated_students = set()
        friend_groups = []

        for student in normal_students:
            if student["id"] in allocated_students:
                continue

            # Create a friend group starting with this student
            friend_group = [student]
            allocated_students.add(student["id"])

            # Add preferred roommates
            for friend_id in student["preferedRoomMates"]:
                if friend_id in student_id_map and friend_id not in allocated_students:
                    friend_group.append(student_id_map[friend_id])
                    allocated_students.add(friend_id)

            friend_groups.append(friend_group)

        print(f"👥 Formed {len(friend_groups)} friend groups")

        # Allocate friend groups to rooms
        for group in friend_groups:
            group_allocated = False
            
            # Try to allocate entire group to the same room
            for room in other_rooms:
                available_capacity = self.get_available_capacity(room)
                if available_capacity >= len(group):
                    # Allocate entire group to this room
                    for student in group:
                        success = self.allocate_student_to_room(room["id"], student["id"], hostel_id)
                        if success:
                            allocation_results.append({
                                "student": student["name"],
                                "studentId": student["id"],
                                "registerNumber": student["registerNumber"],
                                "roomNo": room["roomNo"],
                                "block": room["blockName"],
                                "floor": room["floorNo"]
                            })
                            room["currentStudents"] = room.get("currentStudents", []) + [student["id"]]
                    group_allocated = True
                    print(f"👥 Allocated friend group of {len(group)} students to room {room['roomNo']}")
                    break

            if not group_allocated:
                # Allocate group members to different rooms if needed
                for student in group:
                    student_allocated = False
                    for room in other_rooms:
                        if self.get_available_capacity(room) > 0:
                            success = self.allocate_student_to_room(room["id"], student["id"], hostel_id)
                            if success:
                                allocation_results.append({
                                    "student": student["name"],
                                    "studentId": student["id"],
                                    "registerNumber": student["registerNumber"],
                                    "roomNo": room["roomNo"],
                                    "block": room["blockName"],
                                    "floor": room["floorNo"]
                                })
                                room["currentStudents"] = room.get("currentStudents", []) + [student["id"]]
                                student_allocated = True
                                print(f"👤 Allocated student {student['name']} to room {room['roomNo']}")
                                break
                    
                    if not student_allocated:
                        unallocated.append(student["name"])
                        print(f"❌ Could not allocate student: {student['name']}")

        print(f"📊 Allocation summary: {len(allocation_results)} allocated, {len(unallocated)} unallocated")
        return allocation_results, unallocated

    def run_allocation_for_hostel(self, mass_movement_id, year, hostel_id):
        """Main function to run allocation"""
        print(f"🚀 Starting allocation for MassMovement: {mass_movement_id}, Hostel: {hostel_id}, Year: {year}")
        
        try:
            # Get dataset
            students = self.get_mass_movement_dataset(mass_movement_id, year)
            print(f"✅ Loaded {len(students)} students")
            
            # Get hostel structure
            hostel, blocks, rooms = self.get_hostel_structure(hostel_id)
            print(f"✅ Hostel: {hostel.get('name', 'Unknown')} ({len(blocks)} blocks, {len(rooms)} rooms)")
            
            # Run allocation
            allocation, unallocated = self.allocate_rooms(students, rooms, hostel_id)
            
            result = {
                "success": True,
                "allocated": len(allocation),
                "unallocated": len(unallocated),
                "total_students": len(students),
                "message": f"Allocated {len(allocation)} out of {len(students)} students"
            }
            
            print(f"✅ Allocation completed successfully!")
            return result
            
        except Exception as e:
            print(f"❌ Allocation failed with exception: {str(e)}")
            error_result = {
                "success": False,
                "error": str(e),
                "message": f"Allocation failed: {str(e)}"
            }
            return error_result

def main():
    if len(sys.argv) != 4:
        result = {
            "success": False,
            "error": "Usage: python hostel_allocation.py <mass_movement_id> <hostel_id> <year>"
        }
        print(json.dumps(result))
        sys.exit(1)
    
    mass_movement_id = sys.argv[1]
    hostel_id = sys.argv[2]
    year = int(sys.argv[3])
    
    try:
        allocation_system = HostelAllocationSystem(BASE_URL, JWT_COOKIE)
        result = allocation_system.run_allocation_for_hostel(mass_movement_id, year, hostel_id)
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()