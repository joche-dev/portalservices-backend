export const handleError = (code) => {
    console.log(code);
    switch (code) {
        case "22P02":
            return {
            status: 400,
            message: "Formato no válido en el parámetro",
        };
        case 23502:
            return {
                status: 400,
                message: "Falta informacion en el Query String/Campo de Tabla",
            }; 
        case 204:
            return {
            status: 204,
            message: "No existen registros en la tabla",
        };
        case 401:
            return {
            status: 401,
            message: "contraseña incorrecta",
        };
        case 400:
            return {
            status: 400,
            message: "Faltan datos en la petición",
        };
        case 404:
            return {
            status: 404,
            message: "No existe ese registro en la tabla",
        };
        case 406:
            return {
            status: 406,
            message: "Email registrado en la tabla",
        };
        default:
        return {
            status: 500,
            message: "Error de servidor",
        };
    }
};