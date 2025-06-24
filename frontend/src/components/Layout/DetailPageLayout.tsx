import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../Button/Button';
import { Title } from '../Typography/Title';
import { PageLayout } from './PageLayout';

interface DetailPageLayoutProps {
  title: React.ReactNode;
  backTo: string;
  isEditing: boolean;
  onEditToggle: () => void;
  actionButtons?: React.ReactNode;
  children: React.ReactNode;
}

export function DetailPageLayout({
  title,
  backTo,
  isEditing,
  onEditToggle,
  actionButtons,
  children
}: DetailPageLayoutProps) {
  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link to={backTo}>
            <Button
              variant="secondary"
              icon={ArrowLeft}
              size="sm"
              className="!p-2.5"
              aria-label="Go back"
            />
          </Link>
          <Title variant="page">
            {typeof title === 'string' ? title : <div className="flex items-center">{title}</div>}
          </Title>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing && actionButtons}
          <Button
            variant="primary"
            onClick={onEditToggle}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isEditing ? 'edit-form' : 'details'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </PageLayout>
  );
} 