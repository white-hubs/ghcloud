
export const  getCurrentApplicationCode = ():string=>{
  const applicationCode = JSON.parse(sessionStorage.getItem("GH-currentApplication") as string).code
  return applicationCode as string
}