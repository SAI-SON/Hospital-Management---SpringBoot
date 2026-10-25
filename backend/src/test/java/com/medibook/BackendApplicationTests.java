package com.medibook;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@EnabledIfEnvironmentVariable(named = "DOCKER_AVAILABLE", matches = "true")
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
