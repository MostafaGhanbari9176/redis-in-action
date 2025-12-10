import { Injectable, UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server as WsServer, WebSocket } from 'ws'
import { UserNameService } from "./username.service";
import { WSAuthGuard } from "src/common/guard/ws.auth.guard";

@Injectable()
@WebSocketGateway({ path: '/ws/username' })
@UseGuards(WSAuthGuard)
export class UserNameGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: WsServer

    constructor(readonly usernameSer: UserNameService) { }

    handleConnection(client: any, ...args: any[]) {
        console.log(`new connection, ${client._socket.remoteAddress}`)
    }

    handleDisconnect(client: any) {
        console.log(`client is disconnected, ${client._socket.remoteAddress}`)
    }

    @SubscribeMessage('check')
    async handleCheckEvent(@MessageBody() data: string, @ConnectedSocket() client: WebSocket) {
        console.log(`the user ${client.user.id} from ${client._socket.remoteAddress} send ${data} in check event`)

        try {
            const isAvailable = await this.usernameSer.usernameIsAvailable(data)
            client.send(JSON.stringify({ isAvailable }))
        } catch (e) {
            console.log(e)
            client.send(JSON.stringify({ isAvailable: false, error: e }))
        }
    }
}


