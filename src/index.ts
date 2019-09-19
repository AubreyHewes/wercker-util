/*
  wercker-util
  Copyright (C) 2019  Aubrey Hewes

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import Axios from "axios";
import DotEnv from "dotenv";
import yargs from "yargs";

if (process.env.NODE_ENV === "development") {
  DotEnv.config({
    path: require("path").resolve(process.env.PWD, ".env.development")
  });
}
DotEnv.config({
  path: require("path").resolve(process.env.HOME, ".config/wercker-util/.env")
});

const WerckerApi = (token: string) =>
  Axios.create({
    baseURL: "https://app.wercker.com/api/v3",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

yargs
  .scriptName("wercker-util")
  .version("0.0.0-whiskey-india-papa+1")
  .usage("$0 <cmd> [args]")
  .option("token", {
    demand: true,
    description: "The token to access the Wercker API",
    default: () => process.env.WERCKER_TOKEN,
    defaultDescription: "$WERCKER_TOKEN"
  })
  .command(
    "show-repo [app]",
    "show the repository information",
    yargs =>
      yargs.positional("app", {
        alias: "a",
        describe: "the username/application to display the repository information from"
      }),
    (argv: any) => {
      WerckerApi(argv.token)
        .get(`/applications/${argv.app}`)
        .then(res => res.data)
        .then(data => {
          console.log(`${data.scm.type}@${data.scm.domain}:${data.scm.owner}/${data.scm.repository}`);
          return data;
        })
        .catch(err => {
          if (err.response.status === 401 || err.response.status === 403) {
            console.error("invalid token");
            return;
          }
          console.error(err.response.data.message);
        });
    }
  )
  // .fail((msg, err) => {
  //   if (err) {
  //     throw err; // preserve stack
  //   }
  //   console.error(msg);
  //   process.exit(1);
  // })
  .help().argv;
