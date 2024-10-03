package com.daw.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.daw.model.Documento;
import com.daw.model.Perfil;
import com.daw.model.Seccion;
import com.daw.model.Usuario;
import com.daw.repository.DocumentoRepository;
import com.daw.repository.SeccionRepository;
import com.daw.repository.UsuarioRepository;

import lombok.Data;

@Service
@Data
public class Servicio {
	
	@Autowired
	UsuarioRepository userRepo;
	@Autowired
	DocumentoRepository docRepo;
	@Autowired
	SeccionRepository secRepo;
	
	/*---------------------------- BUSCAR CONCRETO ----------------------------*/
	
	public Usuario buscarUsuario(String nombre){
		return userRepo.findByNombre(nombre);
	}
	public Usuario buscarUsuarioPorUser(String usuario){
		return userRepo.findByUsuario(usuario);
	}
	public Usuario login(String usuario, String contrasena) throws Exception {
		Usuario user = userRepo.findByUsuario(usuario);
		if (user != null) {
	        if(user.getContrasena().equals(contrasena)) {
				return user;
	        } else {
	            throw new Exception("Contraseña incorrecta");
	        }
	    } else {
	        throw new Exception("El usuario no existe");
	    }
	}
	public Documento buscarDocumento(String nombre){
		return docRepo.findByNombre(nombre);
	}
	public Seccion buscarSeccion(Long id){
		return secRepo.getReferenceById(id);
	}
	
	/*---------------------------- BUSCAR TODOS ----------------------------*/
	
	public List<Usuario> buscarUsuarios(){
		return userRepo.findAll();
	}
	public List<Documento> buscarDocumentos(){
		return docRepo.findAll();
	}
	public List<Documento> buscarDocumentosPorDni(String dni){
		return docRepo.findByUsuarioDni(dni);
	}
	public List<Seccion> buscarSecciones(){
		return secRepo.findAll();
	}
	
	/*---------------------------- CREAR ----------------------------*/
	
	public Usuario crearUsuario(String dni, String nombre, String apellidos, String usuario, String contrasena, Perfil perfil) throws Exception {
		Usuario user = new Usuario();
		if (userRepo.existsByDni(user.getDni())) {
            throw new Exception("El DNI ya está registrado");
        } else {
        	user.setDni(dni);
        	user.setNombre(nombre);
        	user.setApellidos(apellidos);
        	user.setUsuario(usuario);
        	user.setContrasena(contrasena);
        	user.setPerfil(perfil);
	        
        	userRepo.save(user);
	        return user;
        }
    }
	public Documento crearDocumento(String nombre, List<Seccion> secciones, Long userId) throws Exception {
		Documento doc = new Documento();
		if (docRepo.existsByNombreAndUsuarioId(nombre, userId)) {
            throw new Exception("El nombre ya se está usando en otro documento");
        } else {
			doc.setNombre(nombre);
			doc.setSecciones(secciones);
			doc.setUsuario(userRepo.getReferenceById(userId));
	        
	        docRepo.save(doc);
	        return doc;
        }
    }
	public Seccion crearSeccion(String nombre, Integer numero, String contenido, Long id) throws Exception {
		Seccion sec = new Seccion();
    	sec.setNombre(nombre);
		sec.setNumero(numero);
		sec.setContenido(contenido);
		sec.setDocumento(docRepo.getReferenceById(id));
        
        secRepo.save(sec);
        return sec;
    }
	
	/*---------------------------- MODIFICAR ----------------------------*/
	
	public Usuario modificarUsuario(Long id, String dni, String nombre, String apellidos, String usuario, String contrasena, Perfil perfil) throws Exception {
		Usuario user = userRepo.getReferenceById(id);
        
		if (userRepo.existsByDni(user.getDni())) {
			
			user.setDni(dni);
        	user.setNombre(nombre);
        	user.setApellidos(apellidos);
        	user.setUsuario(usuario);
        	user.setContrasena(contrasena);
        	user.setPerfil(perfil);
	        
        	userRepo.save(user);
	        return user;
	        
        } else {
            throw new Exception("El usuario no existe");
        }
    }
	public Documento modificarDocumento(Long id, String nombre, List<Seccion> secciones) {
		Documento doc = docRepo.getReferenceById(id);
	    doc.setNombre(nombre);
	    
	    List<Seccion> seccionesActuales = doc.getSecciones();
	    
	    for (Seccion seccionActual : seccionesActuales) {
	        if (!secciones.contains(seccionActual)) {
	            seccionActual.setDocumento(null);
	            secRepo.delete(seccionActual);
	        }
	    }
	    for (Seccion seccionNueva : secciones) {
	        seccionNueva.setDocumento(doc);
	        if (seccionNueva.getId() == null) {
	            secRepo.save(seccionNueva);
	        } else {
	            Seccion seccionExistente = secRepo.getReferenceById(seccionNueva.getId());
	            seccionExistente.setNombre(seccionNueva.getNombre());
	            seccionExistente.setNumero(seccionNueva.getNumero());
	            seccionExistente.setContenido(seccionNueva.getContenido());
	        }
	    }
	    
	    doc.setSecciones(secciones);
	    docRepo.save(doc);
	    return doc;
    }
	public Seccion modificarSeccion(Long id, String nombre, Integer numero, String contenido) {
		Seccion sec = secRepo.getReferenceById(id);
			
		sec.setNombre(nombre);
		sec.setNumero(numero);
		sec.setContenido(contenido);
        
        secRepo.save(sec);
        return sec;
    }
	
	/*---------------------------- ELIMINAR ----------------------------*/
	
	public void eliminarUsuario(Long id) {
		Usuario usuario = userRepo.getReferenceById(id);
		List<Documento> documentos = docRepo.findByUsuarioDni(usuario.getDni());
		for(Documento documento : documentos) {
			List<Seccion> secciones = secRepo.findByDocumentoId(documento.getId());
			for(Seccion seccion : secciones) {
				secRepo.delete(seccion);
			}
			docRepo.delete(documento);
		}
		userRepo.deleteById(id);
	}
	public void eliminarDocumento(Long id) {
		Documento documento = docRepo.getReferenceById(id);
		List<Seccion> secciones = secRepo.findByDocumentoId(documento.getId());
		for(Seccion seccion : secciones) {
			secRepo.delete(seccion);
		}
		docRepo.deleteById(id);
	}
	public void eliminarSeccion(Long id) {
		secRepo.deleteById(id);
	}
	public void eliminarSeccionDefinitivo(Long id) {
		Seccion seccion = secRepo.getReferenceById(id);
		seccion.setDocumento(null);
		secRepo.deleteById(id);
	}
}
