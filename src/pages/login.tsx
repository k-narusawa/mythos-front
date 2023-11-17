import { LoginFlow } from "@ory/client";
import { FormEventHandler, useEffect, useState } from "react";
import ory from "../../pkg/sdk";
import Error from "next/error";
import { useRouter } from "next/router";
import TextInput from "@/src/components/TextInput";
import Button from "@/src/components/Button";

const LoginPage = () => {
  const router = useRouter();
  const { flow: flowId, return_to: returnTo } = router.query;
  const [flow, setFlow] = useState<LoginFlow>();

  useEffect(() => {
    if (!router.isReady || flow) {
      return;
    }

    if (flowId) {
      ory
        .getLoginFlow({ id: String(flowId) })
        .then(({ data }) => {
          setFlow(data);
        }).catch(({ err }) => {
          console.error(err);
        });
    } else {
      ory
        .createBrowserLoginFlow({
          returnTo: returnTo ? String(returnTo) : undefined,
        })
        .then(({ data }) => {
          setFlow(data);
        }).catch(({ err }) => {
          console.error(err);
        });
    }
  }, [flowId, router, router.isReady, returnTo, flow]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!flow) {
      return <div>Flow not found</div>;
    }

    const form = new FormData(event.currentTarget);
    const identifier = form.get("identifier") || "";
    const password = form.get("password") || "";

    const csrf_token = flow.ui.nodes.find(
      (node) => (
        node.group === "default"
        && 'name' in node.attributes
        && node.attributes.name === "csrf_token"
      ))?.attributes.value || "";

    await ory
      .updateLoginFlow({
        flow: flow.id,
        updateLoginFlowBody: {
          "csrf_token": csrf_token,
          "method": "password",
          identifier: identifier,
          password: password,
        },
      }).then(async ({ data }) => {
        console.log(data);
        // アクションによってはここで色々やる
        await router.push(flow.return_to || "/");
      }).catch((err) => {
        console.error(err);
      });
  };

  if (!flow) {
    return <Error statusCode={500}></Error>;
  };

  return (
    <div>
      <h1>ログイン</h1>
      <form onSubmit={handleSubmit}>
        <div className="w-1/2">
          <TextInput
            label="メールアドレス"
            type="email"
            id="identifier"
            name="identifier"
            required
            placeholder="メールアドレス"
          />
        </div>
        <div className="w-1/2">
          <TextInput
            label="パスワード"
            type="password"
            id="password"
            name="password"
            required
            placeholder="パスワード"
          />
        </div>
        <Button type="submit">ログイン</Button>
      </form>
    </div>
  );
};

export default LoginPage;
