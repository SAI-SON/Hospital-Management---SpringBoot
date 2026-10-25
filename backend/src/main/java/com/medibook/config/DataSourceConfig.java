package com.medibook.config;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Sanitizes datasource properties to ensure accidental quotes or trailing spaces
 * in cloud environment variables (e.g. Render, Railway) do not break HikariCP or Flyway.
 */
@Configuration
public class DataSourceConfig implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof DataSourceProperties properties) {
            if (properties.getUrl() != null) {
                properties.setUrl(clean(properties.getUrl()));
            }
            if (properties.getUsername() != null) {
                properties.setUsername(clean(properties.getUsername()));
            }
            if (properties.getPassword() != null) {
                properties.setPassword(clean(properties.getPassword()));
            }
        }
        return bean;
    }

    private String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            if (trimmed.length() >= 2) {
                return trimmed.substring(1, trimmed.length() - 1).trim();
            }
        }
        return trimmed;
    }
}
