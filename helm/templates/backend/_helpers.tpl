{{- /*
    Returns given number of random Hex characters.
*/}}
{{- define "randHex" -}}
    {{- $result := "" -}}
    {{- range $i := until . -}}
        {{- $base := shuffle "0123456789abcdef" -}}
        {{- $i_curr := (randNumeric 1) | int -}}
        {{- $i_next := add $i_curr 1 | int -}}
        {{- $rand_hex := substr $i_curr $i_next $base -}}
        {{- $result = print $result $rand_hex -}}
    {{- end -}}
    {{- $result -}}
{{- end -}}
