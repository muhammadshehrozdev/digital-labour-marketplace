import { MapPinOff } from 'lucide-react';
import { Button, EmptyState } from '../../components/ui';

export default function NotFound() {
  return (
    <EmptyState
      icon={MapPinOff}
      headingLevel={1}
      title="Page not found"
      description="This page does not exist. Yeh page mojood nahi hai."
      action={<Button to="/">Go to the home page</Button>}
    />
  );
}
