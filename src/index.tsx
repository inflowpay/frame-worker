import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { createPayment } from "./api/create-payment";

type FrameState = {
  url: string | null;
};

export const app = new Frog<{ State: FrameState }>({
  title: "Inflow frame",
  initialState: {
    url: null,
  },
  // verify: true,
});

app.frame("/", async (ctx) => {
  const { buttonValue, inputText, status, deriveState } = ctx;

  console.log({
    buttonValue,
    inputText,
    status,
  });

  let message = "Generate a payment link by entering your ETH address.";
  let state = deriveState();

  if (
    status === "response" &&
    (!inputText || !inputText.startsWith("0x") || inputText.length !== 42)
  ) {
    message = "Please enter a valid ETH address.";
  } else if (status === "response" && !buttonValue) {
    message = "Please select an amount.";
  } else if (status === "response" && inputText && buttonValue) {
    try {
      const data = await createPayment(
        inputText.trim(),
        +(buttonValue as string)
      );

      message = "Payment link generated successfully!";
      state = deriveState((prev) => {
        prev.url = data.purchaseUrl;
      });
    } catch (error) {
      message = "An error occurred while generating the payment link.";

      console.error(error);
    }
  }

  const intents = state.url
    ? [
        <Button.Redirect location={state.url}>Go to session</Button.Redirect>,
        // <Button value="share">Share frame</Button>,
      ]
    : [
        <TextInput placeholder="ETH Address" />,
        <Button value="25">$25</Button>,
        <Button value="50">$50</Button>,
        <Button value="100">$100</Button>,
        <Button value="250">$250</Button>,
      ];

  return ctx.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          {message}
        </div>
      </div>
    ),
    intents,
  });
});

const isCloudflareWorker = typeof caches !== "undefined";

if (isCloudflareWorker) {
  // @ts-expect-error
  const manifest = await import("__STATIC_CONTENT_MANIFEST");
  const serveStaticOptions = { manifest, root: "./" };

  app.use("/*", serveStatic(serveStaticOptions));

  devtools(app, { assetsPath: "/frog", serveStatic, serveStaticOptions });
} else {
  devtools(app, { serveStatic });
}

export default app;
