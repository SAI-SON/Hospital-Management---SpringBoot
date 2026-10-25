package com.medibook.service;

import com.medibook.dto.CreateLeaveRequest;
import com.medibook.dto.DoctorAvailabilityDto;
import com.medibook.dto.DoctorLeaveDto;

import java.util.List;

public interface DoctorAvailabilityService {
    List<DoctorAvailabilityDto> getDoctorAvailability(Long doctorId);
    List<DoctorAvailabilityDto> setWeeklyAvailability(Long doctorId, List<DoctorAvailabilityDto> availabilityList);
    List<DoctorLeaveDto> getDoctorLeaves(Long doctorId);
    DoctorLeaveDto addDoctorLeave(Long doctorId, CreateLeaveRequest request);
    void cancelDoctorLeave(Long doctorId, Long leaveId);
}
