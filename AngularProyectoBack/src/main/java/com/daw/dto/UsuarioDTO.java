package com.daw.dto;

import com.daw.model.Perfil;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UsuarioDTO {
	
	@NotEmpty
	@Pattern(regexp = "\\b\\d{8}[A-Za-z]\\b", message = "El DNI debe tener un formato válido")
	private String dni;
	
	@NotEmpty(message = "El nombre no puede estar vacío")
    private String nombre;
    
    @NotEmpty(message = "Los apellidos no pueden estar vacíos")
    private String apellidos;
    
    @NotEmpty(message = "El usuario no puede estar vacío")
    private String usuario;
    
    @NotEmpty(message = "La contraseña no puede estar vacía")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$", 
    		message = "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial")
    private String contrasena;
    
    @NotEmpty(message = "El usuario debe tener un perfil")
	private Perfil perfil;
	
}