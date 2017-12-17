import axios from "axios";
import io from "socket.io-client";
const socket = io('ws://localhost:9000');



const MSG_LIST = 'MSG_LIST';
const MSG_RECV = 'MSG_RECV';
const MSG_READ = 'MSG_READ';

const initState = {
    chatmsg: [],
    users:{},
    unread: 0
}


export function chat(state = initState, action) {
    switch (action.type) {
        case MSG_LIST:
        console.log(111)
            return {
                ...state,
                chatmsg: action.payload.msgs,
                users: action.payload.users,
                unread: action.payload.msgs.filter(v => !v.read && v.to === action.payload.userId).length
            }
        case MSG_RECV:
            const n = action.payload.to === action.userId ? 1 : 0;
            return {
                ...state,
                chatmsg: [...state.chatmsg, action.payload],
                unread: state.unread + n,
            }
        default:
            return state;
    }
}

function msgList(msgs, users, userId) {
    return {
        type: MSG_LIST,
        payload: { msgs, users, userId }
    }
}

export function getMsgList() {
    return (dispatch, getState) => {
        axios.get('/user/getmsglist')
            .then(res => {
                if (res.status === 200 && res.data.code === 0) {
                    const userId = getState().user._id; 
                    dispatch(msgList(res.data.msgs, res.data.users, userId))
                }
            })
    }
}


export function sendMsg({ from, to, msg }) {
    return dispatch => {
        socket.emit('sendmsg', { from, to, msg });
    }
}

function msgRecv(msg, userId) {
    return {
        type: MSG_RECV,
        payload: msg,
        userId
    }
}
export function recvMsg(){
    return (dispatch, getState) => {
        socket.on('recvmsg', function(data) {
            const userId = getState().user._id; 
            dispatch(msgRecv(data, userId))
        })
    }
}
