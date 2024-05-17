import { query } from "@/data/mysql/mysql-viajes";
import type { NextApiRequest, NextApiResponse } 
from "next";
type Data = {
  name?: string;
  success?: boolean;
  data?: any;
  message?: string;
};
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
    ) {
        const { method } = req;
        const { matricula, modelo, anio } = req.body;
        switch (method) {
            case "GET":
                const users = await query("SELECT * FROM auto;");
                res.status(200).json({ success: true, data: users});
                break;
            case "POST":
                    if (!matricula || !modelo) {
                      res.status(400)
                      .json({ success: false, message: "Matricula and modelo are required" });
                      return;
                    }
                    try{
                      const result: any = await query(
                        "INSERT INTO contacts (matricula, modelo, anio) VALUES (?, ?, ?);",
                        [matricula, modelo, anio]
                      );
                      res.status(201).json({
                        success: true,
                        data: "Usuario creado",
                        message: `Matricula del nuevo vehículo: ${result.insertMatricula}`,
                      });
                    } catch (error: any) {
                      res.status(500).json({ success: false, message: error.message });
                    } 
                          res.status(201).json({success: true, data: "Vehículo creado" });
                    break;
            case "PUT":
                if (!matricula) {
                    res.status(400).json({ success: false, message: "matricula is required" });
                    return;
                }
                const fields = [];
                const values = [];
                if (matricula) {
                    fields.push("Matricula = ?");
                    values.push(matricula);
                }
                if (modelo) {
                    fields.push("Modelo = ?");
                    values.push(modelo);
                }
                if (anio) {
                    fields.push("anio = ?");
                    values.push(anio);
                }
                
                if (fields.length === 0) {
                    res.status(400).json({ success: false, message: "At least one field is required" });
                    return;
                }
                const sql = `UPDATE auto SET ${fields.join(", ")} WHERE Matricula = ?;`;
                values.push(matricula);
                try {
                    const result =await query(sql, values);
                    console.log(result);
                    res.status(200).json({ success: true, data: "Usuario actualizado" });
                } catch (error: any) {
                    res.status(500).json({ success: false, message: error.message });
                }
                break;
            case "DELETE":
                const { id } = req.body;
                if (!matricula) {
                    res.status(400).json({ success: false, message: "matricula is required" });
                    return;
                }
                try {
                    const result: any = await query("DELETE FROM auto WHERE matricula = ?;", [matricula]);
                    console.log(result);
                    if (result.affectedRows === 0) {
                        res.status(404).json({ success: false, message: "Vehículo no encontrado" });
                        return;
                    }
                    res.status(200).json({ success: true, data: "Vehículo eliminado" });
                } catch (error: any) {
                    res.status(500).json({ success: false, message: error.message });
                }
                break;
            default:
                res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
                res.status(405).end(`Method ${method} Not Allowed`);
                break;
        }
    }