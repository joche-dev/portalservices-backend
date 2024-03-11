export const handleError = (code, message) => {
    switch (code) {
        case "22P02":
            return {
                status: 400,
                message: "Formato no válido en el parámetro",
        };
        case "42703":
            return {
                status: 400,
                message: "Campo no existente en la tabla",
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
        case 400:
            return {
            status: 400,
            message,
        };
        case 401:
            return {
            status: 401,
            message,
        };
        default:
        return {
            status: 500,
            message: "Error de servidor",
        };
    }
};