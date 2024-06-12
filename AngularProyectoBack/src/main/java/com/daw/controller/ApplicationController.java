package com.daw.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.daw.dto.DocumentoDTO;
import com.daw.dto.SeccionDTO;
import com.daw.dto.UsuarioDTO;
import com.daw.model.Documento;
import com.daw.model.Login;
import com.daw.model.Seccion;
import com.daw.model.Usuario;
import com.daw.service.Servicio;

import jakarta.validation.Valid;

@Validated
@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class ApplicationController {
	
	@Autowired
	private Servicio servicio;
	
	/*---------------------------- BUSCAR CONCRETO ----------------------------*/
	
	@GetMapping("/usuarios/nombre/{nombre}")
	public ResponseEntity<Usuario> buscarUsuario(@PathVariable("nombre") String nombre) {
		return ResponseEntity.ok().body(servicio.buscarUsuario(nombre));
	}
	@GetMapping("/usuarios/usuario/{usuario}")
	public ResponseEntity<Usuario> buscarUsuarioPorUser(@PathVariable("usuario") String usuario) {
		return ResponseEntity.ok().body(servicio.buscarUsuarioPorUser(usuario));
	}
	@PostMapping("/usuarios/login")
	public ResponseEntity<?> login(@RequestBody Login request) throws Exception {
		try {
			return ResponseEntity.ok().body(servicio.login(request.getUsuario(), request.getContrasena()));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}
	@GetMapping("/documentos/nombre/{nombre}")
	public ResponseEntity<Documento> buscarDocumento(@PathVariable("nombre") String nombre) {
		return ResponseEntity.ok().body(servicio.buscarDocumento(nombre));
	}
	@GetMapping("/secciones/{id}")
	public ResponseEntity<Seccion> buscarSeccion(@PathVariable("id") Long id) {
		return ResponseEntity.ok().body(servicio.buscarSeccion(id));
	}
	
	/*---------------------------- BUSCAR TODOS ----------------------------*/
	
	@GetMapping("/usuarios")
	public ResponseEntity<List<Usuario>> buscarUsuarios() {
		return ResponseEntity.ok().body(servicio.buscarUsuarios());
	}
	@GetMapping("/documentos")
	public ResponseEntity<List<Documento>> buscarDocumentos() {
		return ResponseEntity.ok().body(servicio.buscarDocumentos());
	}
	@GetMapping("/documentos/dni/{dni}")
	public ResponseEntity<List<Documento>> buscarDocumentosPorDni(@PathVariable("dni") String dni) {
		return ResponseEntity.ok().body(servicio.buscarDocumentosPorDni(dni));
	}
	@GetMapping("/secciones")
	public ResponseEntity<List<Seccion>> buscarSecciones() {
		return ResponseEntity.ok().body(servicio.buscarSecciones());
	}
	
	/*---------------------------- CREAR ----------------------------*/
	
	@PostMapping("/usuarios")
	public ResponseEntity<?> crearUsuario(@Valid @RequestBody UsuarioDTO usDTO) throws Exception {
		try {
		return ResponseEntity.ok().body(servicio.crearUsuario(usDTO.getDni(),
													  		  usDTO.getNombre(),
													  		  usDTO.getApellidos(),
													  		  usDTO.getUsuario(),
													  		  usDTO.getContrasena(),
													  		  usDTO.getPerfil()));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", e.getMessage()));
		}
	}
	@PostMapping("/documentos")
	public ResponseEntity<?> crearDocumento(@Valid @RequestBody DocumentoDTO docDTO) throws Exception {
		try {
			return ResponseEntity.ok().body(servicio.crearDocumento(docDTO.getNombre(),
																	docDTO.getSecciones(),
																	docDTO.getIdUsuario()));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", e.getMessage()));
		}
	}
	@PostMapping("/secciones")
	public ResponseEntity<?> crearSeccion(@Valid @RequestBody SeccionDTO secDTO) throws Exception {
		try {
			return ResponseEntity.ok().body(servicio.crearSeccion(secDTO.getNombre(),
																  secDTO.getNumero(),
																  secDTO.getContenido(),
																  secDTO.getDocumentoId()));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.singletonMap("error", e.getMessage()));
		}
	}
	
	/*---------------------------- MODIFICAR ----------------------------*/
	
	@PutMapping("/usuarios/{id}")
	public ResponseEntity<Usuario> modificarUsuario(@PathVariable("id") Long id,
													@Valid @RequestBody UsuarioDTO usDTO) throws Exception {
		return ResponseEntity.ok().body(servicio.modificarUsuario(id, usDTO.getDni(),
															  	  	  usDTO.getNombre(),
															  	  	  usDTO.getApellidos(),
															  	  	  usDTO.getUsuario(),
															  	  	  usDTO.getContrasena(),
															  	  	  usDTO.getPerfil()));
	}
	@PutMapping("/documentos/{id}")
	public ResponseEntity<Documento> modificarDocumento(@PathVariable("id") Long id,
														@Valid @RequestBody DocumentoDTO docDTO) {
		return ResponseEntity.ok().body(servicio.modificarDocumento(id, docDTO.getNombre(),
																	docDTO.getSecciones()));
	}
	@PutMapping("/secciones/{id}")
	public ResponseEntity<Seccion> modificarSeccion(@PathVariable("id") Long id,
													@Valid @RequestBody SeccionDTO secDTO) {
		return ResponseEntity.ok().body(servicio.modificarSeccion(id, secDTO.getNombre(), 
															  		  secDTO.getNumero(),
															  		  secDTO.getContenido()));
	}
	
	/*---------------------------- ELIMINAR ----------------------------*/

	@DeleteMapping("/usuarios/{id}")
	public void eliminarUsuario(@PathVariable("id") Long id){
		servicio.eliminarUsuario(id);
	}
	@DeleteMapping("/documentos/{id}")
	public void eliminarDocumento(@PathVariable("id") Long id){
		servicio.eliminarDocumento(id);
	}
	@DeleteMapping("/secciones/{id}")
	
	public void eliminarSeccion(@PathVariable("id") Long id){
		servicio.eliminarSeccion(id);
	}
}
