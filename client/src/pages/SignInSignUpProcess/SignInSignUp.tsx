import { useState, useRef } from "react";
import Signin from "./Signin";
import Signup from "./Signup";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import "../../css/transitions.css";

export default function SignInSignUp({
  isSignInBool = false,
}: {
  isSignInBool?: boolean;
}) {
  const [isSignIn, setIsSignIn] = useState(isSignInBool);

  // Create a ref for the node inside CSSTransition
  const nodeRef = useRef(null);

  const handleSwitch = () => {
    setIsSignIn(!isSignIn);
  };

  return (
    <div className="min-h-screen max-w-full">
      <SwitchTransition>
        <CSSTransition
          nodeRef={nodeRef}
          key={isSignIn ? "signIn" : "signUp"}
          timeout={300}
          classNames="fade"
        >
          <div ref={nodeRef}>
            {isSignIn ? (
              <Signin onSwitch={handleSwitch} />
            ) : (
              <Signup onSwitch={handleSwitch} />
            )}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}
