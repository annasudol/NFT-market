import { v4 as uuidv4 } from "uuid";
import { FileReq } from "@_types/nft";
import { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-iron-session";
import { addressCheckMiddleware, pinataApiKey, pinataSecretApiKey, withSession } from "./utils";
import FormData from "form-data";
import axios from "axios";

export default withSession(async (
    req: NextApiRequest & { session: Session },
    res: NextApiResponse
) => {
    if (req.method === "POST") {
        const {
            bytes,
            fileName,
            contentType
        } = req.body as FileReq;

        if (!bytes || !fileName || !contentType) {
            return res.status(422).send({ message: "Image data are missing" });
        }

        await addressCheckMiddleware(req, res);

        const buffer = Buffer.from(Object.values(bytes));
        const formData = new FormData();

        formData.append(
            "file",
            buffer, {
            contentType,
            filename: fileName + "-" + uuidv4()
        }
        );

        const fileRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                'pinata_api_key': `a5322b306731a117fc2a`,
                'pinata_secret_api_key': `6b6ae2bb50c20389c779c79e8047aa9971f522fd0bd649ea1407476f31dbff2d`,
                "Content-Type": "multipart/form-data"
            }
        });

        return res.status(200).send(fileRes.data);
    } else {
        return res.status(422).send({ message: "Invalid endpoint" });
    }
})