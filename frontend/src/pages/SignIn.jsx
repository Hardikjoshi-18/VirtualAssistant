import React from "react";
import bg from "../assets/authBg.png";
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { userDataContext } from "../context/userContext";
import axios from "axios";

function SignIn() {
    const navigate=useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {serverUrl} = useContext(userDataContext)
  const[email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [loading,setLoading] = useState(false)

  const [err,setErr]=useState("")

  const handleSignIn=async(e)=>{
    e.preventDefault();
    setErr("")
    
    try {
      setLoading(true);
        let result=await axios.post(`${serverUrl}/api/auth/signin`,{
            email,password
        },{withCredentials:true})
        console.log(result);
    } catch (error) {
        console.log(error)
        setErr(error.response.data.message)
    }finally{
      setLoading(false);
    }
  }
  return (
    <div
      className="w-full h-[100vh] bg-cover flex justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form className="w-[90%] h-[630px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]" onSubmit={handleSignIn}>
        <h1 className="text-white text-[30px] font-semibold mb-[30px]">
          Sign In to <span className="text-blue-400">Virtual Assistant</span>
        </h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]"required onChange={(e)=>setEmail(e.target.value)} value={email}
        />
        <div className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white rounded-full text-[18px] relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="password"
            className="w-full h-full rounded-full outline-none bg-transparent  placeholder-gray-300 px-[20px] py-[10px]"required onChange={(e)=>setPassword(e.target.value)} value={password}
          />
          {!showPassword && (
            <IoEye
              onClick={() => setShowPassword(true)}
              className="absolute top-[20px] right-[20px] w-[25px] h-[25px] text-white cursor-pointer"
            />
          )}
          {showPassword && (
            <IoEyeOff
              onClick={() => setShowPassword(false)}
              className="absolute top-[20px] right-[20px] w-[25px] h-[25px] text-white cursor-pointer"
            />
          )}
        </div>
        {err.length>0 && <p className="text-red-500">*{err}</p>}
        <button className="min-w-[150px] h-[60px] mt-[30px] text-black font-semibold text-[19px] bg-white rounded-full" disabled={loading}>{loading?"Loading...":"Sign In"}</button>
        <p onClick={()=> navigate('/signup')} className="text-white text-[18px] cursor-pointer">Want to create a new account ? <span className="text-blue-400"> Sign Up</span></p>
      </form>
    </div>
  );
}

export default SignIn;
