package com.medibook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecializationDto {
    private Long id;
    private String name;
    private String description;
    private String iconName;
    private boolean isActive;
}
