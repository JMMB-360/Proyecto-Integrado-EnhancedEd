package com.daw.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.daw.model.Usuario;

import jakarta.transaction.Transactional;

@Repository
@Transactional
public interface UsuarioRepository extends JpaRepository<Usuario, Long>{

	public Usuario findByNombre(String nombre);
	
	public Usuario findByUsuario(String usuario);
	
	public boolean existsByDni(String dni);
	
}