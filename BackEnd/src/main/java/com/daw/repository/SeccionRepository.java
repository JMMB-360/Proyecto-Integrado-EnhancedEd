package com.daw.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.daw.model.Seccion;

import jakarta.transaction.Transactional;

@Repository
@Transactional
public interface SeccionRepository extends JpaRepository<Seccion, Long>{
	
	public List<Seccion> findByDocumentoId(Long id);
}