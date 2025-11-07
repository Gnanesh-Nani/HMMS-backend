import requests
import sys
import json
from datetime import datetime
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import math

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

    def find_strongly_connected_components(self, students):
        """Find strongly connected components (friend groups) using DFS"""
        print("🔍 Finding strongly connected components (friend groups)...")
        
        # Build adjacency list
        graph = {}
        student_id_map = {}
        
        for student in students:
            student_id = student["id"]
            student_id_map[student_id] = student
            graph[student_id] = []
            
            # Add preferred roommates as directed edges
            for friend_id in student.get("preferedRoomMates", []):
                if friend_id in student_id_map:  # Only add if friend exists in dataset
                    graph[student_id].append(friend_id)
        
        # Kosaraju's algorithm for strongly connected components
        visited = set()
        stack = []
        components = []
        
        # First DFS pass
        def dfs_first(node):
            visited.add(node)
            for neighbor in graph.get(node, []):
                if neighbor not in visited:
                    dfs_first(neighbor)
            stack.append(node)
        
        for student_id in graph:
            if student_id not in visited:
                dfs_first(student_id)
        
        # Build reversed graph
        reversed_graph = {}
        for node in graph:
            reversed_graph[node] = []
        
        for node in graph:
            for neighbor in graph[node]:
                reversed_graph[neighbor].append(node)
        
        # Second DFS pass on reversed graph
        visited.clear()
        
        def dfs_second(node, component):
            visited.add(node)
            component.append(student_id_map[node])
            for neighbor in reversed_graph.get(node, []):
                if neighbor not in visited:
                    dfs_second(neighbor, component)
        
        while stack:
            node = stack.pop()
            if node not in visited:
                component = []
                dfs_second(node, component)
                if len(component) > 1:  # Only consider components with at least 2 students
                    components.append(component)
        
        print(f"🔍 Found {len(components)} strongly connected components")
        for i, component in enumerate(components):
            print(f"  Component {i+1}: {[s['name'] for s in component]}")
        
        return components

    def prepare_features_for_clustering(self, students):
        """Prepare features for K-means clustering"""
        features = []
        
        for student in students:
            # Convert categorical features to numerical
            wakeup_time = self.time_to_minutes(student.get("wakeupTime", "00:00:00"))
            sleep_time = self.time_to_minutes(student.get("sleepTime", "00:00:00"))
            
            # Study habit encoding
            study_habit_map = {"individual-study": 0, "group-study": 1, "flexible": 2}
            study_habit = study_habit_map.get(student.get("studyHabit", "flexible"), 2)
            
            # Department encoding (simplified)
            department = hash(student.get("department", "")) % 10  # Simple hash for department
            
            # Year
            year = student.get("year", 1)
            
            feature_vector = [
                wakeup_time,
                sleep_time,
                study_habit,
                department,
                year
            ]
            features.append(feature_vector)
        
        return np.array(features)

    def cluster_students_kmeans(self, students, n_clusters=None):
        """Cluster students using K-means"""
        if len(students) == 0:
            return []
        
        if n_clusters is None:
            # Determine optimal number of clusters
            n_clusters = min(len(students), max(2, len(students) // 2))
        
        print(f"🎯 Clustering {len(students)} students into {n_clusters} clusters using K-means...")
        
        # Prepare features
        features = self.prepare_features_for_clustering(students)
        
        # Standardize features
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        
        # Apply K-means
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(features_scaled)
        
        # Group students by cluster
        clustered_students = [[] for _ in range(n_clusters)]
        for i, cluster_id in enumerate(clusters):
            clustered_students[cluster_id].append(students[i])
        
        print(f"✅ Clustering completed. Cluster sizes: {[len(cluster) for cluster in clustered_students]}")
        
        return clustered_students

    def allocate_rooms(self, students, rooms, hostel_id):
        """Enhanced allocation algorithm with SCC and K-means"""
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

        # STEP 1: Allocate physically challenged students to ground floor first
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

        # STEP 2: Find and allocate strongly connected components (friend groups)
        scc_groups = self.find_strongly_connected_components(normal_students)
        
        # Track allocated students
        allocated_student_ids = set()
        for result in allocation_results:
            allocated_student_ids.add(result["studentId"])
        
        # Allocate SCC groups
        for group in scc_groups:
            # Filter out already allocated students
            available_group = [s for s in group if s["id"] not in allocated_student_ids]
            
            if len(available_group) == 0:
                continue
                
            group_allocated = False
            
            # Try to allocate entire group to the same room
            for room in other_rooms:
                available_capacity = self.get_available_capacity(room)
                if available_capacity >= len(available_group):
                    # Allocate entire group to this room
                    all_allocated = True
                    for student in available_group:
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
                            allocated_student_ids.add(student["id"])
                        else:
                            all_allocated = False
                    
                    if all_allocated:
                        group_allocated = True
                        print(f"👥 Allocated SCC group of {len(available_group)} students to room {room['roomNo']}")
                        break

            if not group_allocated:
                # Allocate group members individually if whole group can't be allocated together
                for student in available_group:
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
                                allocated_student_ids.add(student["id"])
                                student_allocated = True
                                print(f"👤 Allocated SCC student {student['name']} to room {room['roomNo']}")
                                break
                    
                    if not student_allocated:
                        unallocated.append(student["name"])
                        print(f"❌ Could not allocate SCC student: {student['name']}")

        # STEP 3: Cluster remaining students using K-means and allocate
        remaining_students = [s for s in normal_students if s["id"] not in allocated_student_ids]
        
        if remaining_students:
            print(f"🎯 Clustering {len(remaining_students)} remaining students using K-means...")
            
            # Cluster remaining students
            student_clusters = self.cluster_students_kmeans(remaining_students)
            
            # Allocate clustered students
            for cluster in student_clusters:
                for student in cluster:
                    if student["id"] in allocated_student_ids:
                        continue
                        
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
                                allocated_student_ids.add(student["id"])
                                student_allocated = True
                                print(f"🎯 Allocated K-means clustered student {student['name']} to room {room['roomNo']}")
                                break
                    
                    if not student_allocated:
                        unallocated.append(student["name"])
                        print(f"❌ Could not allocate clustered student: {student['name']}")

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