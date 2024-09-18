import "./toast.css";
import { useEffect, useState } from "react";
import EventBus from "../pubsub/eventBus";
import { createPortal } from "react-dom";
import errorIcon from "./icons/error.png";
import { SET_POSITION } from "./util/position";

// 기존 토스트 라이브러리가 제공하는 기능은 무조건 있어야함
// +@ (1차)
// 이미지나 css를 커스텀할 수 있는 기능 (width, height 포함)
// setTimeOut빼고 예, 아니오 선택 << 약간의 모달 기능도 추가할 수 있는
// 클릭하면 사라짐
// hover하면 대기 (setTimeOut 클린업)

// (2차)
// css animation ex) 번개 콰광
// progressbar
// 로딩 (promise Pending, reject, resolve)

// ToastPortal
const ToastPortal = () => {
  // const [toasts, setToasts] = useState([]);
  const [toasts, setToasts] = useState(
    SET_POSITION.reduce((acc, pos) => {
      // {POSITION: []}
      acc[pos.position] = [];
      return acc;
    }, {})
  );

  useEffect(() => {
    const handleToastEvent = (toast) => {
      const newToast = { id: Date.now(), ...toast };

      console.log("toast", toast);

      setToasts((prevToasts) => {
        const updatedToasts = { ...prevToasts };
        // 특정 포지션 배열에 토스트 추가해줌
        updatedToasts[toast.position] = [
          ...updatedToasts[toast.position],
          newToast,
        ];
        return updatedToasts;
      });

      setTimeout(() => {
        setToasts((prevToasts) => {
          const updatedToasts = { ...prevToasts };
          // 특정 포지션에서 같은 id값을 가진 toast 제거해줌
          updatedToasts[toast.position] = updatedToasts[toast.position].filter(
            (t) => t.id !== newToast.id
          );
          return updatedToasts;
        });
      }, toast.time);
    };
    const unsubscribe = EventBus.subscribe("SHOW_TOAST", handleToastEvent);

    return () => unsubscribe();
  }, []);

  console.log("렌더링");

  return createPortal(
    <div className="toast-wrap">
      {/* 각 위치에 대한 key를 가져와서 순회함 */}
      {Object.keys(toasts).map((positionKey) => {
        const positionToasts = toasts[positionKey];
        return positionToasts.length > 0 ? (
          <div className={`toast-container ${positionKey}`} key={positionKey}>
            {positionToasts.map((toast) => (
              <Toast key={toast.id} toast={toast} />
            ))}
          </div>
        ) : null;
      })}
    </div>,
    document.body
  );
};

// Toast
const Toast = ({ toast }) => {
  const [progressWidth, setProgressWidth] = useState(100);

  useEffect(() => {
    setProgressWidth(0);
  }, []);

  const getToastClass = () => {
    return toast.bg ? `${toast.theme}-bg` : toast.theme;
  };

  const toastClass = getToastClass();

  return (
    // <div className={`toast ${toast.theme ? toast.theme : defaultTheme}`}>
    <div className={`toast ${toastClass}`}>
      <div>
        <img className="icon" src={errorIcon}></img>
      </div>
      {toast.message}
      {toast.showProgress && (
        <div
          className="toast-progress-bar"
          style={{
            transition: `width ${toast.time / 1000}s ease`,
            width: `${progressWidth}%`,
          }}
        ></div>
      )}
      {toast.confirm && (
        <div>
          <span
            onClick={() => {
              toast.confirm(true);
            }}
          >
            예{" "}
          </span>
          <span
            onClick={() => {
              toast.confirm(false);
            }}
          >
            아니오
          </span>
        </div>
      )}
    </div>
  );
};

export default ToastPortal;
