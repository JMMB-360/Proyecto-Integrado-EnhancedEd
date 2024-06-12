package com.daw.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.daw.model.Documento;

import jakarta.transaction.Transactional;

@Repository
@Transactional
public interface DocumentoRepository extends JpaRepository<Documento, Long>{

	public Documento findByNombre(String nombre);

	public List<Documento> findByUsuarioDni(String dni);
	
	public boolean existsByNombreAndUsuarioId(String nombre, Long userId);
	
}