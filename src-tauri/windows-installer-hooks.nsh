!macro NSIS_HOOK_POSTINSTALL
  StrCpy $R0 "悠然工具箱"
  StrCmp $LANGUAGE 1033 0 +2
    StrCpy $R0 "YouranToolbox"
  StrCmp $LANGUAGE 1041 0 +2
    StrCpy $R0 "悠然ツールボックス"
  StrCmp $LANGUAGE 1042 0 +2
    StrCpy $R0 "Youran 툴박스"

  StrCmp $R0 "YouranToolbox" +4 0
  Delete "$DESKTOP\\$R0.lnk"
  Delete "$SMPROGRAMS\\$R0.lnk"
  Delete "$SMPROGRAMS\\$STARTMENU_FOLDER\\$R0.lnk"

  IfFileExists "$DESKTOP\\YouranToolbox.lnk" 0 +2
    Rename "$DESKTOP\\YouranToolbox.lnk" "$DESKTOP\\$R0.lnk"

  IfFileExists "$SMPROGRAMS\\YouranToolbox.lnk" 0 +2
    Rename "$SMPROGRAMS\\YouranToolbox.lnk" "$SMPROGRAMS\\$R0.lnk"

  IfFileExists "$SMPROGRAMS\\$STARTMENU_FOLDER\\YouranToolbox.lnk" 0 +2
    Rename "$SMPROGRAMS\\$STARTMENU_FOLDER\\YouranToolbox.lnk" "$SMPROGRAMS\\$STARTMENU_FOLDER\\$R0.lnk"
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  Delete "$DESKTOP\\悠然工具箱.lnk"
  Delete "$DESKTOP\\悠然ツールボックス.lnk"
  Delete "$DESKTOP\\Youran 툴박스.lnk"
  Delete "$DESKTOP\\YouranToolbox.lnk"

  Delete "$SMPROGRAMS\\悠然工具箱.lnk"
  Delete "$SMPROGRAMS\\悠然ツールボックス.lnk"
  Delete "$SMPROGRAMS\\Youran 툴박스.lnk"
  Delete "$SMPROGRAMS\\YouranToolbox.lnk"

  Delete "$SMPROGRAMS\\$STARTMENU_FOLDER\\悠然工具箱.lnk"
  Delete "$SMPROGRAMS\\$STARTMENU_FOLDER\\悠然ツールボックス.lnk"
  Delete "$SMPROGRAMS\\$STARTMENU_FOLDER\\Youran 툴박스.lnk"
  Delete "$SMPROGRAMS\\$STARTMENU_FOLDER\\YouranToolbox.lnk"
!macroend
