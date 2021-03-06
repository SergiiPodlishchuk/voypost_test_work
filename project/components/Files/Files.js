import React from "react";
import { PdfPreview } from "./";
import { ReactComponent as FileIcon } from "../icons/fileIcon.svg";

import { Grid } from "@material-ui/core";
import ChipsInput from "./ChipsInput";

const Files = ({ files, setFiles, handleChipClick }) => {
  return (
    <>
      <Grid item xs={12}>
        <ChipsInput
          isLineType
          type="files"
          label="Attached File:"
          borderType="square"
          onClick={handleChipClick}
          value={files.map((attachment) => attachment?.name || "") || []}
          icon={<FileIcon width={13} height={13} />}
          onDeleteChip={(index) =>
            setFiles([...files.slice(0, index), ...files.slice(index + 1)])
          }
        />
        {files ? (
          <PdfPreview
            open={previewOpen}
            setOpen={setPreviewOpen}
            files={files as File[]}
            selectedFileIndex={currentAttachmentIndex}
            setFileIndex={setCurrentAttachmentIndex}
          />
        ) : null}
      </Grid>
    </>
  );
};

export default Files;
