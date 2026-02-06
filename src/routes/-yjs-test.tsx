import { SharedTextarea } from "./-components/SharedTextarea";

/**
 * A test page demonstrating the reusable SharedTextarea component.
 * This component is not a route, but is used for testing purposes.
 * The id prop is hardcoded for demonstration. In a real app,
 * this would likely come from the URL or other context.
 */
export function Test() {
  return (
    <div className="p-4 space-y-8 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold">Yjs Text Sync Demo</h1>
        <p className="text-gray-600">
          This page demonstrates a reusable, collaborative textarea component.
        </p>
      </header>

      <section>
        <h2 className="font-semibold text-lg">Synced Text Areas</h2>
        <p className="text-sm text-gray-600 mb-2">
          These two text areas share the same `docId` and `valueName`, so their
          content will be synced in real-time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SharedTextarea docId="demo-room-1" valueName="shared-content" />
          <SharedTextarea docId="demo-room-1" valueName="shared-content" />
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg">Independent Text Area</h2>
        <p className="text-sm text-gray-600 mb-2">
          This text area has a different `id`, so its state is completely
          separate from the boxes above.
        </p>
        <SharedTextarea docId="demo-room-2" valueName="isolated-content" />
      </section>
    </div>
  );
}
