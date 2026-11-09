import Dialog from './Dialog';

// Side panel (right on desktop, bottom sheet on phones) for decisions and mobile filters.
export default function Drawer(props) {
  return <Dialog {...props} variant="drawer" />;
}
