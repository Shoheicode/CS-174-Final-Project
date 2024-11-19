import { addData, database } from "../firebase"

function intro(){

}

function myFunction(){
    console.log("HELLO")
    // set(red(database, "hi"), {
    //     username: "HELLO",
    // })
    addData()
}

export {myFunction}