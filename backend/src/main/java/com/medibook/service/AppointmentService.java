package com.medibook.service;

import com.medibook.dto.*;
import com.medibook.entity.AppointmentStatus;

import java.time.LocalDate;

public interface AppointmentService {
    AppointmentResponseDto bookAppointment(Long patientUserId, BookAppointmentRequest request);
    AppointmentResponseDto cancelAppointment(Long userId, Long appointmentId, CancelAppointmentRequest request);
    AppointmentResponseDto rescheduleAppointment(Long patientUserId, Long appointmentId, RescheduleAppointmentRequest request);
    AppointmentResponseDto doctorUpdateStatus(Long doctorUserId, Long appointmentId, AppointmentStatus newStatus);
    AppointmentResponseDto doctorAddConsultationNotes(Long doctorUserId, Long appointmentId, ConsultationNotesRequest request);
    PageResponse<AppointmentResponseDto> getPatientAppointments(Long patientUserId, AppointmentStatus status, int page, int size);
    PageResponse<AppointmentResponseDto> getDoctorAppointments(Long doctorUserId, LocalDate date, AppointmentStatus status, int page, int size);
    AppointmentResponseDto getAppointmentById(Long userId, Long appointmentId);
}
