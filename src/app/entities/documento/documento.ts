import { retry } from "rxjs";
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

    async buscarDocumentoPorNombre(nombre: string, skipErr?: boolean) {
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
            if(!skipErr) {
                console.error("Error en la solicitud:", error);
            }
            return null;
        }
    }
    
    async crearDocumento(nombre: string, secciones: Seccion[], idUsuario?: number, mensajes?: boolean) {
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
            if(mensajes) {
                if (respuesta && respuesta.error) {
                    alert("El nombre ya está en uso ❌");
                    return false;
                } else if (respuesta && respuesta.id) {
                    alert("Documento creado correctamente ✔️");
                    return true;
                } else {
                    console.log("Error: Respuesta inesperada del servidor ❌: "+ respuesta);
                    return false;
                }
            } else {
                return respuesta.id ? true : false;
            }
        } catch (error) {
            console.error("Error al crear documento: ");
            console.error(error);
            return false;
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
