
import { query } from "@/data/mysql/mysql-clients";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name?: string;
  success?: boolean;
  data?: any;
  message?: string;
};


function setCORSHeaders(res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  setCORSHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { method } = req;
  const { id, name, phone, email, address } = req.body;

  switch (method) {
    case "GET":
      try {
        const users = await query("SELECT * FROM contacts;");
        res.status(200).json({ success: true, data: users });
      } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
      }
      break;

    case "POST":
      if (!name || !email) {
        res.status(400).json({ success: false, message: "Name and email are required" });
        return;
      }
      try {
        const result: any = await query(
          "INSERT INTO contacts (name, phone, email, address) VALUES (?, ?, ?, ?);",
          [name, phone, email, address]
        );
        res.status(201).json({
          success: true,
          data: "Usuario creado",
          message: `ID del nuevo usuario: ${result.insertId}`,
        });
      } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
      }
      break;

    case "PUT":
      if (!id) {
        res.status(400).json({ success: false, message: "ID is required" });
        return;
      }
      const fields = [];
      const values = [];
      if (name) {
        fields.push("name = ?");
        values.push(name);
      }
      if (phone) {
        fields.push("phone = ?");
        values.push(phone);
      }
      if (email) {
        fields.push("email = ?");
        values.push(email);
      }
      if (address) {
        fields.push("address = ?");
        values.push(address);
      }
      if (fields.length === 0) {
        res.status(400).json({ success: false, message: "No fields provided for update" });
        return;
      }
      const sql = `UPDATE contacts SET ${fields.join(", ")} WHERE id = ?;`;
      values.push(id);
      try {
        await query(sql, values);
        res.status(200).json({ success: true, data: "Usuario actualizado" });
      } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
      }
      break;

    case "DELETE":
      const { deleteId } = req.body;
      if (!deleteId) {
        res.status(400).json({ success: false, message: "ID is required for deletion" });
        return;
      }
      try {
        await query("DELETE FROM contacts WHERE id = ?;", [deleteId]);
        res.status(200).json({ success: true, data: "Usuario eliminado" });
      } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE", "OPTIONS"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
