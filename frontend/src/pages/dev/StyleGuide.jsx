import { useState } from 'react';
import { Mail, Plus, Search, Trash2 } from 'lucide-react';
import Logo, { LogoMark } from '../../components/brand/Logo';
import { SceneArt, TradeArt, SCENE_IDS, TRADE_ART_IDS } from '../../components/illustrations';
import {
  Alert, Avatar, Badge, Button, Card, Checkbox, Combobox, ConfirmDialog, DataTable, Dialog, Drawer, EmptyState, IconButton,
  PageHeader, Pagination, PasswordField, ProgressBar, ProgressRing, RadioCardGroup, Section, Select, Skeleton, StatusChip,
  Stepper, Switch, Tabs, TextArea, TextField, useToast, STATUS,
} from '../../components/ui';
import ThemePicker from './ThemePicker';
import styles from './StyleGuide.module.css';

// Development only (/dev/styleguide): every component and state, for the team and the viva.
export default function StyleGuide() {
  const toast = useToast();
  const [radio, setRadio] = useState('a');
  const [check, setCheck] = useState(true);
  const [on, setOn] = useState(false);
  const [tab, setTab] = useState('one');
  const [page, setPage] = useState(2);
  const [dialog, setDialog] = useState('');
  const [text, setText] = useState('میں پانچ سال سے وائرنگ کرتا ہوں');
  const [picked, setPicked] = useState('');

  return (
    <div className={styles.page}>
      <PageHeader eyebrow="Development only" title="Style guide" description="Tokens and components of the Digital Labour Marketplace design system (docs/design/03-design-system.md)." />
      <ThemePicker />

      <Section title="Brand">
        <Card className={styles.row}><Logo size={40} /><LogoMark size={16} title="Mark at 16 px" /><LogoMark size={32} title="Mark at 32 px" /><LogoMark size={64} title="Mark at 64 px" /></Card>
      </Section>

      <Section title="Illustrations (design v3)" id="illustrations" description="One style: fixed grid, one line weight, five theme colours. Hover a drawing to see its small animation.">
        <Card className={styles.artGrid}>
          {TRADE_ART_IDS.map((id) => <figure key={id}><TradeArt category={id} size={96} /><figcaption>{id}</figcaption></figure>)}
        </Card>
        <Card className={styles.artGrid}>
          {SCENE_IDS.map((id) => <figure key={id}><SceneArt name={id} size={160} /><figcaption>{id}</figcaption></figure>)}
        </Card>
        <div className={`${styles.artGrid} ${styles.artDark} dark-section`}>
          {TRADE_ART_IDS.slice(0, 5).map((id) => <figure key={id}><TradeArt category={id} size={96} tone="dark" /></figure>)}
          {SCENE_IDS.slice(8, 11).map((id) => <figure key={id}><SceneArt name={id} size={160} tone="dark" /></figure>)}
        </div>
      </Section>

      <Section title="Buttons">
        <Card className={styles.stack}>
          {['primary', 'secondary', 'ghost', 'danger'].map((v) => (
            <div key={v} className={styles.row}>
              <Button variant={v} size="sm">{v} sm</Button>
              <Button variant={v}>{v} md</Button>
              <Button variant={v} size="lg" icon={Plus}>{v} lg</Button>
              <Button variant={v} disabled>Disabled</Button>
              <Button variant={v} loading>Loading</Button>
            </div>
          ))}
          <div className={styles.row}><IconButton label="Delete item" icon={Trash2} /><IconButton label="Search" icon={Search} size="sm" /></div>
        </Card>
      </Section>

      <Section title="Form fields">
        <Card className={styles.grid}>
          <TextField label="Text field" placeholder="Placeholder" hint="A short hint." />
          <TextField label="Required with error" required error="This field is required." defaultValue="x" />
          <TextField label="Disabled" disabled value="Cannot edit" readOnly />
          <PasswordField label="Password" />
          <Select label="Select" placeholder="Choose one" options={[{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }]} />
          <Combobox label="Combobox" hint={picked ? `Picked: ${picked}` : 'Type to search'} options={[{ value: '1', label: 'House wiring', group: 'Electrical & Solar' }, { value: '2', label: 'Geyser installation', group: 'Plumbing & Sanitary' }, { value: '3', label: 'House cleaning', group: 'Domestic Work' }]} onSelect={(o) => setPicked(o.label)} />
          <div className={styles.full}><TextArea label="Text area (Urdu, dir=auto)" urdu maxLength={200} value={text} onChange={(e) => setText(e.target.value)} /></div>
          <Checkbox label="Checkbox" hint="With a hint" checked={check} onChange={setCheck} />
          <Checkbox label="Disabled checkbox" checked disabled onChange={() => {}} />
          <Switch label="Switch" checked={on} onChange={setOn} />
          <div className={styles.full}>
            <RadioCardGroup legend="Radio cards" name="sg" value={radio} onChange={setRadio} columns={2} options={[
              { value: 'a', title: 'I want to find work', description: 'Selected state', icon: Mail },
              { value: 'b', title: 'I want to hire a worker', description: 'Default state', icon: Search },
            ]} />
          </div>
        </Card>
      </Section>

      <Section title="Status chips and badges">
        <Card className={styles.stack}>
          <div className={styles.row}>{Object.keys(STATUS.identity).map((s) => <StatusChip key={s} kind="identity" status={s} />)}</div>
          <div className={styles.row}>{Object.keys(STATUS.skill).map((s) => <StatusChip key={s} kind="skill" status={s} />)}</div>
          <div className={styles.row}>{['neutral', 'primary', 'success', 'warning', 'danger', 'info', 'accent'].map((t) => <Badge key={t} tone={t}>{t}</Badge>)}</div>
          <div className={styles.row}>{['Rashid Mehmood', 'Sana Tariq', 'Usman', 'Ayesha Khan', 'Bilal', 'Zainab Ali'].map((n) => <Avatar key={n} name={n} />)}</div>
        </Card>
      </Section>

      <Section title="Progress and steps">
        <Card className={styles.stack}>
          <Stepper steps={[{ id: 'a', label: 'About you' }, { id: 'b', label: 'Your work' }, { id: 'c', label: 'Your skills' }, { id: 'd', label: 'Proof' }, { id: 'e', label: 'All set' }]} current="c" completed={['a', 'b']} />
          <div className={styles.row}><ProgressRing value={65} label="Example ring" /><div className={styles.grow}><ProgressBar value={40} label="Example bar" /></div></div>
        </Card>
      </Section>

      <Section title="Feedback">
        <div className={styles.stack}>
          <Alert tone="info" title="Info">Something worth knowing.</Alert>
          <Alert tone="success" title="Success">It was saved.</Alert>
          <Alert tone="warning" title="Warning">Please check this.</Alert>
          <Alert tone="danger" title="Error">It did not work.</Alert>
          <div className={styles.row}>
            <Button variant="secondary" onClick={() => toast.show({ title: 'Saved', message: 'A success toast.' })}>Show toast</Button>
            <Button variant="secondary" onClick={() => toast.show({ tone: 'danger', title: 'Could not save' })}>Error toast</Button>
          </div>
          <EmptyState icon={Search} headingLevel={3} title="Empty state" description="One sentence that explains what to do." action={<Button size="sm">One action</Button>} />
          <Card className={styles.stack}><Skeleton lines={3} /><Skeleton variant="block" /></Card>
        </div>
      </Section>

      <Section title="Navigation and data">
        <Card className={styles.stack}>
          <Tabs label="Example tabs" value={tab} onChange={setTab} tabs={[{ id: 'one', label: 'First', content: <p>First panel</p> }, { id: 'two', label: 'Second', content: <p>Second panel</p> }]} />
          <Pagination page={page} pages={5} onChange={setPage} />
          <DataTable caption="Example table" rowKey={(r) => r.id} columns={[{ key: 'name', header: 'Name', sortable: true }, { key: 'trade', header: 'Trade', sortable: true }, { key: 'years', header: 'Years', sortable: true, align: 'end' }]} rows={[{ id: 1, name: 'Example A', trade: 'Plumber', years: 5 }, { id: 2, name: 'Example B', trade: 'Electrician', years: 2 }]} />
        </Card>
      </Section>

      <Section title="Overlays">
        <Card className={styles.row}>
          <Button variant="secondary" onClick={() => setDialog('dialog')}>Dialog</Button>
          <Button variant="secondary" onClick={() => setDialog('confirm')}>Confirm dialog</Button>
          <Button variant="secondary" onClick={() => setDialog('drawer')}>Drawer</Button>
        </Card>
      </Section>
      <Dialog open={dialog === 'dialog'} onClose={() => setDialog('')} title="Dialog title" description="Esc closes it; focus returns to the button.">
        <p>Dialog body.</p>
      </Dialog>
      <ConfirmDialog open={dialog === 'confirm'} title="Show the full CNIC?" message="This will be recorded in the audit log." confirmLabel="Show CNIC" onConfirm={() => setDialog('')} onCancel={() => setDialog('')} />
      <Drawer open={dialog === 'drawer'} onClose={() => setDialog('')} title="Drawer" footer={<Button onClick={() => setDialog('')}>Done</Button>}>
        <p>Right on desktop, bottom sheet on phones.</p>
      </Drawer>
    </div>
  );
}
