import { Documento } from "../documento/documento";

export enum Perfil {
    ADMINISTRADOR = 'ADMINISTRADOR',
    PROFESOR = 'PROFESOR'
}

export class Usuario {
    id: number = 0;
    dni: string;
    nombre: string;
    apellidos: string;
    usuario: string;
    contrasena: string;
    perfil: Perfil;
    tema: string;
    documentos: Documento[] = [];

    public static logedUser: Usuario | null;

    constructor(dni?: string, nombre?: string, apellidos?: string, usuario?: string,
                contrasena?: string, perfil?: Perfil, tema?: string) {
        this.dni = dni ?? '';
        this.nombre = nombre ?? '';
        this.apellidos = apellidos ?? '';
        this.usuario = usuario ?? '';
        this.contrasena = contrasena ?? '';
        this.perfil = perfil ?? Perfil.ADMINISTRADOR;
        this.tema = tema ?? '';
    }
    
    static setUsuarioLogueado(usuario: Usuario): void {
        this.logedUser = usuario;
    }

    static getUsuarioLogueado(): Usuario | null {
        return this.logedUser;
    }

    static clearUsuarioLogueado(): void {
        this.logedUser = null;
    }

    static updateUsuarioTheme(tema: string): void {
        if (this.logedUser) {
            this.logedUser.tema = tema;
        }
    }

    async buscarTodosLosUsuarios() {
        const URL = `http://localhost:9999/usuarios`;
        const respuesta = await fetch(URL).then(respuesta => respuesta.json());
        return respuesta;
    }
    
    async buscarUsuarioPorNombre(nombre: string) {
        const URL = `http://localhost:9999/usuarios/nombre/${nombre}`;
        const configuracion = {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
        try {
            const respuesta = await fetch(URL, configuracion);
            return respuesta.json();
        } catch (error) {
            console.error("Error en la solicitud: ", error);
        }
    }
    
    async buscarUsuarioPorUser(usuario: string) {
        const URL = `http://localhost:9999/usuarios/usuario/${usuario}`;
        const configuracion = {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
        try {
            const respuesta = await fetch(URL, configuracion);
            if (!respuesta.ok && usuario != "root") {
                console.error(`Error: ${respuesta.status}`);
                return null;
            }
            return await respuesta.json();
        } catch (error) {
            if(usuario != "root") {
                console.error("Error en la solicitud: ", error);
            }
        }
    }
    
    async login(usuario: string, contrasena: String) {
        const URL = `http://localhost:9999/usuarios/login`;
        const body = { usuario: usuario, contrasena: contrasena };
        const configuracion = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(body)
        }
        try {
            const respuesta = await fetch(URL, configuracion);
            if(respuesta.ok) {
                const datos = await respuesta.json();
                return datos;
            } else {
                const errorData = await respuesta.json();
                throw new Error(errorData.message);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    }
    
    async crearUsuario(dni: string, nombre: string, apellidos: string, usuario: string, contrasena: string, perfil: Perfil) {
        const URL = `http://localhost:9999/usuarios`;
        const configuracion = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ dni, nombre, apellidos, usuario, contrasena, perfil })
        }
        try {
            const respuesta = await fetch(URL, configuracion).then(respuesta => respuesta.json());
            if (respuesta && respuesta.error) {
                return 'ECode01';
              } else if (respuesta && respuesta.usuario) {
                return 'OK';
              } else {
                console.log(respuesta);
                return 'ECode02';
              }
        } catch (error) {
            console.error("Error al crear usuario:", error);
            return error;
        }
    }
    
    async modificarUsuario(id: number, dni: string, nombre: string, apellidos: string, usuario: string, contrasena: string, perfil: Perfil) {
        const URL = `http://localhost:9999/usuarios/${id}`;
        const configuracion = {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ dni, nombre, apellidos, usuario, contrasena, perfil })
        }
        const respuesta = await fetch(URL, configuracion).then(respuesta => respuesta.json());
        return respuesta;
    }
    
    async modificarTemaUsuario(id: number, tema: string) {
        const URL = `http://localhost:9999/usuarios/tema/${id}/${tema}`;
        const configuracion = {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
        const respuesta = await fetch(URL, configuracion);
        Usuario.updateUsuarioTheme(tema);
        return respuesta;
    }

    async eliminarUsuario(id: number) {
        const URL = `http://localhost:9999/usuarios/${id}`;
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
