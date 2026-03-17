import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API = axios.create({ baseURL: API_URL });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// Auth
export const loginUser = (data) => API.post("/auth/login", data);
export const registerStudent = (data) => API.post("/auth/register/student", data);
export const registerFaculty = (data) => API.post("/auth/register/faculty", data);
export const getMe = () => API.get("/auth/me");
export const updateProfile = (data) => API.put("/auth/profile", data, { headers: { "Content-Type": "multipart/form-data" } });
export const changePassword = (data) => API.put("/auth/change-password", data);

// Notifications
export const getNotifications = () => API.get("/notifications");
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put("/notifications/read-all");

// Courses
export const getCourses = (params) => API.get("/courses", { params });
export const getCourse = (id) => API.get(`/courses/${id}`);
export const getMyCourses = () => API.get("/courses/my-courses");
export const createCourse = (data) => API.post("/courses", data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const enrollCourse = (id) => API.post(`/courses/${id}/enroll`);

// Materials
export const uploadMaterial = (data) => API.post("/materials/upload", data, { headers: { "Content-Type": "multipart/form-data" } });
export const updateMaterial = (id, data) => API.put(`/materials/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
export const getCourseMaterials = (courseId) => API.get(`/materials/course/${courseId}`);
export const approveMaterial = (id) => API.put(`/materials/${id}/approve`);
export const deleteMaterial = (id) => API.delete(`/materials/${id}`);
export const getPendingMaterials = () => API.get("/materials/pending");

// Exams
export const createExam = (data) => API.post("/exams", data);
export const getCourseExams = (courseId) => API.get(`/exams/course/${courseId}`);
export const getExam = (id) => API.get(`/exams/${id}`);
export const submitExam = (id, data) => API.post(`/exams/${id}/submit`, data);
export const toggleExam = (id) => API.put(`/exams/${id}/toggle`);

// Schedules
export const createSchedule = (data) => API.post("/schedules", data);
export const getUpcomingSchedules = () => API.get("/schedules/upcoming");
export const getCourseSchedules = (courseId) => API.get(`/schedules/course/${courseId}`);
export const updateScheduleStatus = (id, status) => API.put(`/schedules/${id}/status`, { status });
export const deleteSchedule = (id) => API.delete(`/schedules/${id}`);

// Results
export const getMyResults = () => API.get("/results/my-results");
export const getExamResults = (examId) => API.get(`/results/exam/${examId}`);
export const getResult = (id) => API.get(`/results/${id}`);

// Admin
export const getAdminStats = () => API.get("/admin/stats");
export const getAdminUsers = (params) => API.get("/admin/users", { params });
export const approveUser = (id, data) => API.put(`/admin/users/${id}/approve`, data);
export const toggleUserStatus = (id) => API.put(`/admin/users/${id}/toggle-status`);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const getAllCourses = () => API.get("/admin/courses");
export const getAdminLeaderboard = () => API.get("/admin/leaderboard");
export const seedAdmin = () => API.post("/admin/seed");


// Chat
export const getConversations = () => API.get("/chat/conversations");
export const startConversation = (receiverId) => API.post("/chat/conversations", { receiverId });
export const getMessages = (conversationId) => API.get(`/chat/messages/${conversationId}`);
export const sendMessage = (data) => API.post("/chat/messages", data, { headers: { "Content-Type": "multipart/form-data" } });
export const getFaculty = () => API.get("/faculty");


export default API;
