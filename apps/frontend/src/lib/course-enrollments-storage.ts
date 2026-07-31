"use client";

export interface UserCourseEnrollment {
  id: string;
  courseId: string;
  title: string;
  certificationCode: string;
  category: string;
  progressPercent: number;
  completedModules: number;
  totalModules: number;
  durationLeft: string;
  lastLessonTitle: string;
  trainerName: string;
  deliveryType: 'E-learning 24/7' | 'Visioconférence Live';
  enrolledAt: string;
}

const ENROLLMENTS_KEY = 'eds_user_course_enrollments_v1';

export function getUserCourseEnrollments(): UserCourseEnrollment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ENROLLMENTS_KEY);
    if (!raw) {
      return []; // Default empty if user hasn't enrolled in any course yet
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading course enrollments:", err);
    return [];
  }
}

export function enrollInCourse(course: {
  id: string;
  title: string;
  certificationCode: string;
  category: string;
  totalModules?: number;
  trainerName?: string;
  deliveryType?: 'E-learning 24/7' | 'Visioconférence Live';
}) {
  if (typeof window === 'undefined') return;
  const existing = getUserCourseEnrollments();
  if (existing.some(e => e.courseId === course.id)) {
    return; // Already enrolled
  }

  const newEnrollment: UserCourseEnrollment = {
    id: `enr-${Date.now()}`,
    courseId: course.id,
    title: course.title,
    certificationCode: course.certificationCode || 'CERT',
    category: course.category || 'Formation IT',
    progressPercent: 0, // Starts at 0% real video progress
    completedModules: 0,
    totalModules: course.totalModules || 10,
    durationLeft: 'Non démarré',
    lastLessonTitle: 'Module 1 : Introduction & Présentation',
    trainerName: course.trainerName || 'Dr. Tariq Berrada',
    deliveryType: course.deliveryType || 'E-learning 24/7',
    enrolledAt: new Date().toISOString()
  };

  const updated = [newEnrollment, ...existing];
  localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('enrollmentsUpdated'));
  return newEnrollment;
}

export function updateCourseProgress(courseId: string, watchedPercent: number, completedModulesCount: number) {
  if (typeof window === 'undefined') return;
  const existing = getUserCourseEnrollments();
  const updated = existing.map(e => {
    if (e.courseId === courseId || e.id === courseId) {
      const pct = Math.min(100, Math.max(0, watchedPercent));
      return {
        ...e,
        progressPercent: pct,
        completedModules: completedModulesCount,
        durationLeft: pct >= 100 ? 'Formation Terminée' : `${Math.round((1 - pct / 100) * 15)}h restantes`
      };
    }
    return e;
  });
  localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('enrollmentsUpdated'));
}
