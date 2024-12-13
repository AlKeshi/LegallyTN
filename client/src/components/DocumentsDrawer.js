import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Drawer, 
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
const DOCUMENTS_WIDTH = 500;
const DocumentsDrawer = ({ open, onClose, documents = [] }) => (
  <Drawer
    variant="persistent"
    anchor="right"
    open={open}
    sx={{
      width: 300,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: DOCUMENTS_WIDTH,
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #e0e0e0',
        mt: '64px', // Match your existing header height
      },
    }}
  >
    <Box sx={{ p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        borderBottom: '1px solid #e0e0e0',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ArticleIcon color="error" />
          <Typography variant="h6" sx={{ color: '#666' }}>
            Reference Documents
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" color="error">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ overflow: 'auto' }}>
        {documents.map((doc, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: '#f8f9fa',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#f0f0f0',
                boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ArticleIcon color="error" fontSize="small" />
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: '#ff3e3e', 
                  fontWeight: 600 
                }}
              >
                Document {index + 1}
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#444',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}
            >
              {doc.content}
            </Typography>
          </Paper>
        ))}
        {documents.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4, 
            color: '#666' 
          }}>
            <ArticleIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography variant="body1">
              No reference documents available
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  </Drawer>
);

export default DocumentsDrawer;