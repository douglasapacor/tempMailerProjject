import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import csvParser from "csv-parser";
import { app, ipcMain } from "electron";
import serve from "electron-serve";
import * as fs from "fs";
import path from "path";
import { createWindow } from "./helpers";

const isProd = process.env.NODE_ENV === "production";

const clientSES = new SESClient({
  region: "sa-east-1",
  credentials: {
    accessKeyId: "AKIAXQT5JNASAYCF6NUS",
    secretAccessKey: "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",
  },
});

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();

    ipcMain.on("startProcess", async (event, arg) => {
      const htmlContent = fs.readFileSync(arg.pathFileHtml, "utf-8");
      const emails = [];

      fs.createReadStream(arg.pathFileLista)
        .pipe(csvParser({ separator: ";" }))
        .on("data", (row) => {
          emails.push(row.email);
          mainWindow.webContents.send("addTotal", 1);
        })
        .on("end", () => {
          const delay = 1000 / 13;

          emails.forEach((email, index) => {
            setTimeout(async () => {
              try {
                const emailRes = await clientSES.send(
                  new SendEmailCommand({
                    Destination: {
                      ToAddresses: [`${email}`],
                    },
                    Message: {
                      Body: {
                        Text: {
                          Charset: "UTF-8",
                          Data: htmlContent, //aquii
                        },
                        Html: {
                          Charset: "UTF-8",
                          Data: htmlContent, //aquii
                        },
                      },
                      Subject: {
                        Charset: "UTF-8",
                        Data: arg.subject, //aquii
                      },
                    },
                    Source: "INR Publicaçoes <inr@publicacoesinr.com.br>", //aquii
                  })
                );

                console.log("Email enviado", email);
                mainWindow.webContents.send("sended", 1);

                console.log(emailRes);
              } catch (error) {
                console.log(error);

                mainWindow.webContents.send("sended", 0);
              }
            }, index * delay);
          });
        });
    });
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});
