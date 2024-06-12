export class Seccion {
    id: number = 0;
    nombre: string;
    numero: number;
    contenido: string;
    idDocumento: number;

    constructor(nombre?: string, numero?: number, contenido?: string, idDocumento?: number) {
        this.nombre = nombre ?? '';
        this.numero = numero ?? 0;
        this.contenido = contenido ?? '';
        this.idDocumento = idDocumento ?? 0;
    }
    
    async buscarTodasLasSecciones() {
        const URL = `http://localhost:9999/secciones`;
        const respuesta = await fetch(URL).then(respuesta => respuesta.json());
        return respuesta;
    }

    async buscarSeccionPorId(id: number) {
        const URL = `http://localhost:9999/secciones/${id}`;
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
    
    async crearSeccion(nombre: string, numero: number, contenido: string, documentoId: number) {
        const URL = `http://localhost:9999/secciones`;
        const configuracion = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ nombre, numero, contenido, documentoId })
        }
        try {
            const respuesta = await fetch(URL, configuracion).then(respuesta => respuesta.json());
            if (respuesta && respuesta.error) {
                alert("El título ya está en uso ❌");
            } else if (respuesta && respuesta.nombre) {
                return respuesta;
            } else {
                console.log(respuesta);
                alert("Error: Respuesta inesperada del servidor ❌");
            }
        } catch (error) {
            console.error("Error al crear sección:", error);
            return error;
        }
    }
    
    async modificarSeccion(id: number, nombre: string, numero: number, contenido: string) {
        const URL = `http://localhost:9999/secciones/${id}`;
        const configuracion = {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ nombre, numero, contenido })
        }
        try {
            const respuesta = await fetch(URL, configuracion).then(respuesta => respuesta.json());
            
            if (respuesta && respuesta.error) {
                alert("El título ya está en uso ❌");
            } else if (respuesta && respuesta.id) {
                alert("Sección modificada correctamente ✔️");
                return respuesta;
            } else {
                console.log(respuesta);
                alert("Error: Respuesta inesperada del servidor ❌");
            }
        } catch (error) {
            console.error("Error al crear sección:", error);
            return error;
        }
    }
    
    async eliminarSeccion(id: number) {
        const URL = `http://localhost:9999/secciones/${id}`;
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
