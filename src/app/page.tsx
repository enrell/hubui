import AddServiceForm from "@/components/AddServiceForm";
import ServiceGrid from "@/components/ServiceGrid";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <main className="flex flex-col items-center gap-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to HubUI</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            HubUI is a service aggregator that lets you access all your services from one place. 
            Add your favorite services below and access them securely through the navbar.
          </p>
        </div>
        
        <AddServiceForm />
        
        <div className="w-full">
          <h2 className="text-2xl font-semibold mb-6 text-center">Your Services</h2>
          <ServiceGrid />
        </div>
        
        <div className="mt-8 space-y-4 text-center max-w-2xl">
          <h2 className="text-lg font-semibold">How to use HubUI</h2>
          <div className="bg-muted/50 rounded-lg p-6 text-left">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Add a service by entering its name and URL (must start with http:// or https://)</li>
              <li>The service will appear as a card below and as a button in the navbar</li>
              <li>Click a service card or navbar button to open it in a secure iframe</li>
              <li>To delete services: long-press or right-click on a card to select it, then use the delete button</li>
              <li>All your services are stored locally in your browser</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}