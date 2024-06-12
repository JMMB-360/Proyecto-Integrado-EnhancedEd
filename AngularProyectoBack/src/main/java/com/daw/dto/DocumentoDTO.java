package com.daw.dto;

import java.util.List;

import com.daw.model.Seccion;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class DocumentoDTO {
	
	@NotEmpty
	private String nombre;
	
	private List<Seccion> secciones;
	
	@NotEmpty
	private Long idUsuario;
	
}