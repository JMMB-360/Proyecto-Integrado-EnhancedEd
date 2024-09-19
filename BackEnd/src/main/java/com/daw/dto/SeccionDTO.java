package com.daw.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SeccionDTO {
	
	@NotEmpty
	private String nombre;

	@NotNull
	private Integer numero;
	
	private String contenido;
	
	@NotNull
	private Long documentoId;
	
}