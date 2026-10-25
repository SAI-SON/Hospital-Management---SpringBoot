package com.medibook.service;

import com.medibook.dto.*;
import com.medibook.entity.Doctor;
import com.medibook.entity.DoctorAvailability;
import com.medibook.entity.Specialization;
import com.medibook.exception.ResourceNotFoundException;
import com.medibook.repository.DoctorAvailabilityRepository;
import com.medibook.repository.DoctorRepository;
import com.medibook.repository.SpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final SpecializationRepository specializationRepository;
    private final DoctorAvailabilityRepository availabilityRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DoctorSummaryDto> searchDoctors(
            String search,
            Long specializationId,
            String city,
            BigDecimal minFee,
            BigDecimal maxFee,
            Boolean availableOnly,
            BigDecimal minRating,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir.equalsIgnoreCase("desc") ? "DESC" : "ASC"),
                getSortField(sortBy));
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sort);

        Page<Doctor> doctorPage = doctorRepository.searchDoctors(
                (search != null && !search.isBlank()) ? search.trim() : null,
                specializationId,
                (city != null && !city.isBlank()) ? city.trim() : null,
                minFee,
                maxFee,
                availableOnly,
                minRating,
                pageable
        );

        Page<DoctorSummaryDto> dtoPage = doctorPage.map(this::toSummaryDto);
        return PageResponse.from(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorDetailDto getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));

        List<DoctorAvailabilityDto> availability = availabilityRepository.findByDoctorOrderByDayOfWeekAsc(doctor)
                .stream()
                .map(this::toAvailabilityDto)
                .toList();

        return toDetailDto(doctor, availability);
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorDetailDto getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user id: " + userId));

        List<DoctorAvailabilityDto> availability = availabilityRepository.findByDoctorOrderByDayOfWeekAsc(doctor)
                .stream()
                .map(this::toAvailabilityDto)
                .toList();

        return toDetailDto(doctor, availability);
    }

    @Override
    @Transactional
    public DoctorDetailDto updateDoctorProfile(Long doctorId, DoctorUpdateRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        Specialization specialization = specializationRepository.findById(request.getSpecializationId())
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found with id: " + request.getSpecializationId()));

        doctor.setFullName(request.getFullName().trim());
        doctor.setSpecialization(specialization);
        doctor.setYearsOfExperience(request.getYearsOfExperience());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setBio(request.getBio());
        doctor.setClinicAddress(request.getClinicAddress());
        doctor.setClinicCity(request.getClinicCity());
        doctor.setPhoneNumber(request.getPhoneNumber());
        if (request.getAvatarUrl() != null) {
            doctor.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getIsAvailable() != null) {
            doctor.setAvailable(request.getIsAvailable());
        }

        Doctor savedDoctor = doctorRepository.save(doctor);

        List<DoctorAvailabilityDto> availability = availabilityRepository.findByDoctorOrderByDayOfWeekAsc(savedDoctor)
                .stream()
                .map(this::toAvailabilityDto)
                .toList();

        return toDetailDto(savedDoctor, availability);
    }

    @Override
    @Transactional
    public void approveDoctor(Long doctorId, boolean isApproved) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        doctor.setApproved(isApproved);
        doctorRepository.save(doctor);
    }

    private String getSortField(String sortBy) {
        return switch (sortBy.toLowerCase()) {
            case "fee", "fees", "consultationfee" -> "consultationFee";
            case "experience", "yearsofexperience" -> "yearsOfExperience";
            case "rating", "ratingaverage" -> "ratingAverage";
            case "name", "fullname" -> "fullName";
            default -> "ratingAverage";
        };
    }

    private DoctorSummaryDto toSummaryDto(Doctor doctor) {
        return DoctorSummaryDto.builder()
                .id(doctor.getId())
                .userId(doctor.getUser().getId())
                .fullName(doctor.getFullName())
                .email(doctor.getUser().getEmail())
                .specializationName(doctor.getSpecialization().getName())
                .specializationId(doctor.getSpecialization().getId())
                .yearsOfExperience(doctor.getYearsOfExperience())
                .consultationFee(doctor.getConsultationFee())
                .clinicCity(doctor.getClinicCity())
                .clinicAddress(doctor.getClinicAddress())
                .avatarUrl(doctor.getAvatarUrl())
                .ratingAverage(doctor.getRatingAverage())
                .totalReviews(doctor.getTotalReviews())
                .isAvailable(doctor.isAvailable())
                .isApproved(doctor.isApproved())
                .build();
    }

    private DoctorDetailDto toDetailDto(Doctor doctor, List<DoctorAvailabilityDto> availability) {
        return DoctorDetailDto.builder()
                .id(doctor.getId())
                .userId(doctor.getUser().getId())
                .fullName(doctor.getFullName())
                .email(doctor.getUser().getEmail())
                .licenseNumber(doctor.getLicenseNumber())
                .specialization(SpecializationDto.builder()
                        .id(doctor.getSpecialization().getId())
                        .name(doctor.getSpecialization().getName())
                        .description(doctor.getSpecialization().getDescription())
                        .iconName(doctor.getSpecialization().getIconName())
                        .isActive(doctor.getSpecialization().isActive())
                        .build())
                .yearsOfExperience(doctor.getYearsOfExperience())
                .consultationFee(doctor.getConsultationFee())
                .bio(doctor.getBio())
                .clinicAddress(doctor.getClinicAddress())
                .clinicCity(doctor.getClinicCity())
                .phoneNumber(doctor.getPhoneNumber())
                .avatarUrl(doctor.getAvatarUrl())
                .ratingAverage(doctor.getRatingAverage())
                .totalReviews(doctor.getTotalReviews())
                .isAvailable(doctor.isAvailable())
                .isApproved(doctor.isApproved())
                .weeklyAvailability(availability)
                .build();
    }

    private DoctorAvailabilityDto toAvailabilityDto(DoctorAvailability avail) {
        return DoctorAvailabilityDto.builder()
                .id(avail.getId())
                .dayOfWeek(avail.getDayOfWeek())
                .startTime(avail.getStartTime())
                .endTime(avail.getEndTime())
                .slotDurationMinutes(avail.getSlotDurationMinutes())
                .breakStartTime(avail.getBreakStartTime())
                .breakEndTime(avail.getBreakEndTime())
                .isActive(avail.isActive())
                .build();
    }
}
