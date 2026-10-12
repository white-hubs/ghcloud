interface Application {
  applicationGroupId: string;
  code: string;
  icon: string;
  id: string;
  name: string;
}
interface UseApplicationInfo{
  getCurrentApplicationStore: () => Application;
}
export const useApplicationInfo = (): UseApplicationInfo=>{
  function getCurrentApplicationStore (): Application{
    const store = sessionStorage.getItem('GH-currentApplication')
    if (!store){
      throw new Error('can not find storage for GH-currentApplication')
    }
    return JSON.parse(store) as Application
  }
  return {
    getCurrentApplicationStore
  }
}