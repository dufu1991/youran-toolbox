!macro NSIS_HOOK_POSTINSTALL
  StrCpy $R0 "Youran Toolbox"
  StrCmp $LANGUAGE 2052 0 +2
    StrCpy $R0 "悠然工具箱"
  StrCmp $LANGUAGE 1028 0 +2
    StrCpy $R0 "悠然工具箱"
  StrCmp $LANGUAGE 1041 0 +2
    StrCpy $R0 "悠然ツールボックス"
  StrCmp $LANGUAGE 1042 0 +2
    StrCpy $R0 "Youran 툴박스"

  IfFileExists "$DESKTOP\\Youran Toolbox.lnk" 0 +2
    Rename "$DESKTOP\\Youran Toolbox.lnk" "$DESKTOP\\$R0.lnk"

  IfFileExists "$SMPROGRAMS\\Youran Toolbox.lnk" 0 +2
    Rename "$SMPROGRAMS\\Youran Toolbox.lnk" "$SMPROGRAMS\\$R0.lnk"

  IfFileExists "$SMPROGRAMS\\$STARTMENU_FOLDER\\Youran Toolbox.lnk" 0 +2
    Rename "$SMPROGRAMS\\$STARTMENU_FOLDER\\Youran Toolbox.lnk" "$SMPROGRAMS\\$STARTMENU_FOLDER\\$R0.lnk"
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  Delete "$DESKTOP\\悠然工具箱.lnk"
  Delete "$DESKTOP\\悠然ツールボックス.lnk"
  Delete "$DESKTOP\\Youran 툴박스.lnk"
  Delete "$DESKTOP\\Youran Toolbox.lnk"

  Delete "$SMPROGRAMS\\悠然工具箱.lnk"
  Delete "$SMPROGRAMS\\悠然ツールボックス.lnk"
  Delete "$SMPROGRAMS\\Youran 툴박스.lnk"
  Delete "$SMPROGRAMS\\Youran Toolbox.lnk"

  Delete "$SMPROGRAMS\\$STARTMENU_FOLDER\\悠然工具箱.lnk"
  Delete "$SMPROGRAMS\\$STARTMENU_FOLDER\\悠然ツールボックス.lnk"
  Delete "$SMPROGRAMS\\$STARTMENU_FOLDER\\Youran 툴박스.lnk"
  Delete "$SMPROGRAMS\\$STARTMENU_FOLDER\\Youran Toolbox.lnk"
!macroend
