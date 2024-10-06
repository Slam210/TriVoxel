import { useState } from "react";
import Signin from "./Signin";
import Signup from "./Signup";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import "./transitions.css";

export default function SignInSignUp({
  isSignInBool = false,
}: {
  isSignInBool?: boolean;
}) {
  const [isSignIn, setIsSignIn] = useState(isSignInBool);

  const handleSwitch = () => {
    setIsSignIn(!isSignIn);
  };

  return (
    <div className="min-h-screen max-w-7xl">
      <SwitchTransition>
        <CSSTransition
          key={isSignIn ? "signIn" : "signUp"}
          timeout={300}
          classNames="fade"
        >
          <div>
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
