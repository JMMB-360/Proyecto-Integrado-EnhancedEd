package com.daw.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.ToString;

@Data
@Entity
@Table(name="SECCION")
public class Seccion {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "ID")
	private Long id;
	
	@Column(name = "NOMBRE")
	private String nombre;
	
	@Column(name = "NUMERO")
	private Integer numero;

	@Lob
	@Column(name = "CONTENIDO", columnDefinition = "LONGTEXT")
	private String contenido;
	
	@ManyToOne
	@JsonBackReference
	@ToString.Exclude
    @JoinColumn(name = "DOCUMENTO_ID")
    private Documento documento;
	
}