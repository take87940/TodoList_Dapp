import { useState } from "react";
import Web3 from "web3";
import "../index.css"
import {ABI, Address} from "../Global/contracts.js"

const web3 = new Web3();
var contract;
var userAccount;
var account;

const Home = () => {
    const [index, setIndex] = useState(0);
    const [event, setEvent] = useState("");
    const [ethBalance, setEthBalance] = useState("");
    const [connected, setConnected] = useState(false);
    const [provider, setProvider] = useState();
    const [contractConn, setContractConn] = useState(false);
    const [toggleIndex, setToggleIndex] = useState(0);
    const [renameEvent, setRenameEvent] = useState("");
    const [renameIndex, setRenameIndex] = useState(0);
    const [taskList, setTaskList] = useState([]);

    function connect2BlockChain(){
        if(!provider)
        {
            if(window.ethereum){
                setProvider(window.ethereum);
            } else if (window.web3) {
                setProvider(window.web3.currentProvider);
            } else {
                console.log("Non-ethereum browser detected. You should install Matamask");
            }
            console.log(provider)
        }
        else
        {
            console.log("已有Provider!");
        }
    }

    const connect2Wallet = async() =>
    {
        if(!account)
        {
            console.log("HIHI");
            await provider.request({method: 'eth_requestAccounts'});
            web3.setProvider(new Web3.providers.HttpProvider("http://localhost:7545"));
            userAccount = await web3.eth.getAccounts();
            account = userAccount[0];
            const ethBalance = await web3.eth.getBalance(account);
            setEthBalance(String(ethBalance));
            console.log(ethBalance);
            setConnected(true);
        }
        else
        {
            console.log("已連上錢包 無須再連");
        }
    }

    const connect2Contract = async() =>
    {   
        if(!contract)
        {
            contract = new web3.eth.Contract(ABI, Address);
            console.log(contract);
            setContractConn(true);
            await initTaskList();
        }
        else
        {
            console.log("已獲取合約");
        }
    }

    const initTaskList = async() =>
    {   
        setTaskList([]);
        var length = 0;
        try{
            while(true)
            {
                const task = await contract.methods.todos(length).call();
                const _text = task.text;
                const _completed = task.completed;
                const _id = length;
                setTaskList(function(prev)
                {
                    return [...prev, { _id, _text, _completed}];
                });
                length++;
            }
        }catch(e)
        {
            console.log("初始化完畢!!");
        }
    }

    const createTask = async() =>
    {   
        console.log(contract);
        await contract.methods.create(event).send({from:account});
        initTaskList();
    }

    const getTask = async()=>
    {   
        const task = await contract.methods.get(index).call();
        console.log(index, task);
    }

    const getAllTask = async() =>
    {   
        console.log(taskList);
        var length = 0;
        try{
            while(true)
            {
                const task = await contract.methods.todos(length).call();
                console.log(length, task.text, task.completed);
                length++;
            }
        }catch(e)
        {
            console.log("查詢完畢!!");
        }
    }

    const toggleTask = async() =>
    {
        const task = await contract.methods.toggleCompleted(toggleIndex).send({from:account});
        console.log(toggleIndex, task);
        initTaskList();
    }

    const rename = async() =>
    {
        const task = await contract.methods.updateTest(renameIndex, renameEvent).send({from:account});
        console.log(renameIndex, task);
        initTaskList();
    }

    const indexChange = (e) =>
    {
        setIndex(e.target.value);
    }

    const eventChange = (e) =>
    {
        setEvent(e.target.value);
    }

    const renameIndexChange = (e) =>
    {
        setRenameIndex(e.target.value);
    }

    const renameEventChange = (e) =>
    {
        setRenameEvent(e.target.value);
    }

    const toggleIndexChange = (e) =>
    {
        setToggleIndex(e.target.value);
    }

    return(
        <div>
            <div>
                {provider &&(
                    <div>已接上區塊鏈</div>
                )}
                {!provider &&(
                    <div>未接上區塊鏈</div>
                )}
                {connected &&(
                    <div>
                        <div>
                            <span>Account: </span>
                            {account}
                        </div>
                        <div>
                            <span>Balance: </span>
                            {ethBalance}
                        </div>
                    </div>
                )}
                {!connected &&(
                    <div>未連接錢包</div>
                )}
                <div>
                    <span>合約地址: </span>
                    {contractConn && (
                        <span>{Address}</span>
                    )}
                    {!contractConn && (
                        <span>未獲取</span>
                    )}
                </div>
                <div className="init">
                    <div onClick={connect2BlockChain} className="function">連接上鏈</div>
                    <div onClick={connect2Wallet} className="function">連接錢包</div>
                    <div onClick={connect2Contract} className="function">獲取合約</div>
                </div>
                <div>
                    <p>事件:</p>
                    <input type="text" onChange={eventChange}></input>
                    <div onClick={createTask} className="function">創建事件</div>
                </div>
                <div>
                    <p>欲查詢的index:</p>
                    <input type="number" onChange={indexChange}></input>
                    <div onClick={getTask} className="function">查詢事件</div>
                </div>
                <div onClick={getAllTask} className="function">查詢所有事件</div>
                <div>
                    <p>欲更新的index:</p>
                    <input type="number" onChange={renameIndexChange}></input>
                    <p>欲更新的事件:</p>
                    <input type="text" onChange={renameEventChange}></input>
                    <div onClick={rename} className="function">更新事件</div>
                </div>
                <div>
                    <p>欲 打勾/取消打勾 的ID:</p>
                    <input type="number" onChange={toggleIndexChange}></input>
                    <div onClick={toggleTask} className="function">完成事件</div>
                </div>
            </div>
            <div>
                {taskList.map((task) => {
                    const { _id, _text, _completed } = task;
                    return(
                        <div className="item">
                            <div className="word">
                                ID:{_id}
                            </div>
                            <div className="word">
                                Event:{_text}
                            </div>
                            <div>
                                {_completed &&( 
                                    <span>已完成</span>
                                )}    
                                {!_completed &&( 
                                    <span>未完成</span>
                                )}   
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Home;