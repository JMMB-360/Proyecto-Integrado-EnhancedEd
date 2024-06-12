import { Seccion } from "../seccion/seccion";

export class Documento {
    id: number = 0;
    nombre: string;
    secciones: Seccion[];
    idUsuario: number;

    constructor(nombre?: string, secciones?: Seccion[], idUsuario?: number) {
        this.nombre = nombre ?? '';
        this.secciones = secciones ?? [];
        this.idUsuario = idUsuario ?? 0;
    }
    
    async buscarTodosLosDocumentos() {
        const URL = `http://localhost:9999/documentos`;
        const respuesta = await fetch(URL).then(respuesta => respuesta.json());
        return respuesta;
    }
//todo: Eliminar
    async buscarDocumentosPorDni(dni: string) {
        const URL = `http://localhost:9999/documentos/dni/${dni}`;
        const configuracion = {
            method: "GET",
            headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
            }
        }
        try {
            const respuesta = await fetch(URL, configuracion);
            return await respuesta.json();

        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    }

    async buscarDocumentoPorNombre(nombre: string) {
        const URL = `http://localhost:9999/documentos/nombre/${nombre}`;
        const configuracion = {
            method: "GET",
            headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
            }
        }
        try {
            const respuesta = await fetch(URL, configuracion);
            return await respuesta.json();

        } catch (error) {
            console.error("Error en la solicitud:", error);
        }
    }
    
    async crearDocumento(nombre: string, secciones: Seccion[], idUsuario?: number) {
        const URL = `http://localhost:9999/documentos`;
        const configuracion = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ nombre, secciones, idUsuario })
        }
        try {
            const respuesta = await fetch(URL, configuracion).then(respuesta => respuesta.json());
            
            if (respuesta && respuesta.error) {
                return "El nombre ya esta en uso ❌";
            } else if (respuesta && respuesta.id) {
                return "Documento creado correctamente ✔️";
            } else {
                console.log("Error: "+respuesta);
                return "Error: Respuesta inesperada del servidor ❌";
            }
        } catch (error) {
            console.error("Error al crear documento:", error);
            return error;
        }
    }
    
    async modificarDocumento(id: number, nombre: string, secciones: Seccion[]) {
        const URL = `http://localhost:9999/documentos/${id}`;
        const configuracion = {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ nombre, secciones })
        }
        const respuesta = await fetch(URL, configuracion).then(respuesta => respuesta.json());
        return respuesta;
    }
    
    async eliminarDocumento(id: number) {
        const URL = `http://localhost:9999/documentos/${id}`;
        const configuracion = {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        }
        const respuesta = await fetch(URL, configuracion);
        return respuesta;
    }
}
