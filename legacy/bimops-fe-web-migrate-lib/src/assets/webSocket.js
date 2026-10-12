export function useWebSocket(handleMessage) {
  const ws = new WebSocket(window.config.websoketUrl);
  const init = () => {
    eventListener();
  };

  function eventListener() {
    ws.addEventListener("open", handleOpen, false);
    ws.addEventListener("close", handleClose, false);
    ws.addEventListener("error", handleError, false);
    ws.addEventListener("message", handleMessage, false);
  }

  function handleOpen(e) {
  }
  function handleClose(e) {
  }
  function handleError(e) {
  }

  init();

  return ws;
}
