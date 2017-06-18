// @flow

import { Client } from 'ssh2';

type Connection = {
  exec: (
    connection: Connection,
    command: string,
    options?: ExecOptions
  ) => Connection,
  on: (event: string, callback: Function) => Connection,
};

type ConnectArgs = {
  host: string,
  port: number,
  username: string,
  privateKey: string,
};

export async function sshConnect(args: ConnectArgs): Promise<Connection> {
  return new Promise((resolve, reject) => {
    const connection = new Client();

    connection.on('ready', () => {
      resolve(connection);
    });

    connection.on('error', error => {
      reject(error);
    });

    connection.connect(args);
  });
}

type ExecOptions = {};

export async function sshExec(
  connection: Connection,
  command: string,
  options?: ExecOptions = {}
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    connection.exec(command, options, (error, stream) => {
      if (error) {
        reject(error);
      } else {
        stream.on('data', data => {
          resolve(data);
        });

        stream.stderr.on('data', data => {
          reject(new Error(data));
        });
      }
    });
  });
}
